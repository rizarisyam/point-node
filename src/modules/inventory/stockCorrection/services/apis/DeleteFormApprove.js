const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeleteFormApprove {
  constructor(tenantDatabase, { approver, stockCorrectionId }) {
    this.tenantDatabase = tenantDatabase;
    this.approver = approver;
    this.stockCorrectionId = stockCorrectionId;
  }

  async call() {
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: { id: this.stockCorrectionId },
      include: [
        { model: this.tenantDatabase.Form, as: 'form' },
        { model: this.tenantDatabase.StockCorrectionItem, as: 'items' },
      ],
    });

    validate(stockCorrection, this.approver);

    const { form } = stockCorrection;
    await deleteJournal(this.tenantDatabase, form);
    await restoreStock(this.tenantDatabase, { stockCorrection, form });
    await updateForm(form, this.approver);

    return { stockCorrection };
  }
}

function validate(stockCorrection, approver) {
  if (!stockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction is not exist');
  }
  const { form } = stockCorrection;
  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden - You are not selected approver');
  }
  if (form.cancellationStatus !== 0) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Stock correction is not requested to be delete');
  }
  if (form.done) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Can not delete already referenced stock correction');
  }
}

async function deleteJournal(tenantDatabase, form) {
  await tenantDatabase.Journal.destroy({ where: { formId: form.id } });
}

async function restoreStock(tenantDatabase, { stockCorrection, form }) {
  const stockCorrectionItems = stockCorrection.items;
  let updateItemsStock = [];
  if (form.approvalStatus === 1 && form.cancellationStatus !== 1) {
    updateItemsStock = stockCorrectionItems.map(async (stockCorectionItem) => {
      const item = await stockCorectionItem.getItem();
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
