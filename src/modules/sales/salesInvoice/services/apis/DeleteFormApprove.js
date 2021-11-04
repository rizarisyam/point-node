const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeleteFormApprove {
  constructor(tenantDatabase, { approver, salesInvoiceId }) {
    this.tenantDatabase = tenantDatabase;
    this.approver = approver;
    this.salesInvoiceId = salesInvoiceId;
  }

  async call() {
    const salesInvoice = await this.tenantDatabase.SalesInvoice.findOne({
      where: { id: this.salesInvoiceId },
      include: [
        { model: this.tenantDatabase.Form, as: 'form' },
        { model: this.tenantDatabase.SalesInvoiceItem, as: 'items' },
      ],
    });

    validate(salesInvoice, this.approver);

    const { form } = salesInvoice;
    await deleteJournal(this.tenantDatabase, form);
    await restoreStock(this.tenantDatabase, { salesInvoice, form });
    await updateForm(form, this.approver);

    return { salesInvoice };
  }
}

function validate(salesInvoice, approver) {
  if (!salesInvoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sales invoice is not exist');
  }
  const { form } = salesInvoice;
  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (form.cancellationStatus !== 0) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Sales invoice is not requested to be delete');
  }
  if (form.done) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Can not delete already referenced sales invoice');
  }
}

async function deleteJournal(tenantDatabase, form) {
  await tenantDatabase.Journal.destroy({ where: { formId: form.id } });
}

async function restoreStock(tenantDatabase, { salesInvoice, form }) {
  const salesInvoiceItems = salesInvoice.items;
  let updateItemsStock = [];
  if (form.approvalStatus === 1 && form.cancellationStatus !== 1) {
    updateItemsStock = salesInvoiceItems.map(async (salesInvoiceItem) => {
      const item = await salesInvoiceItem.getItem();
      const totalQuantityItem = item.quantity * item.converter;

      return item.update({
        stock: item.stock + totalQuantityItem,
      });
    });
  }

  await Promise.all([...updateItemsStock, deleteInventory(tenantDatabase, form)]);
}

function deleteInventory(tenantDatabase, form) {
  return tenantDatabase.Inventory.destroy({ where: { formId: form.id } });
}

async function updateForm(form, approver) {
  await form.update({
    cancellationStatus: 1,
    cancellationApprovalAt: new Date(),
    cancellationApprovalBy: approver.id,
  });
}

module.exports = DeleteFormApprove;
