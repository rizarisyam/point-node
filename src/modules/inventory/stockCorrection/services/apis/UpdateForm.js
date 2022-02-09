const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const GetCurrentStock = require('@src/modules/inventory/services/GetCurrentStock');
const ProcessSendUpdateApprovalWorker = require('../../workers/ProcessSendUpdateApproval.worker');

class UpdateForm {
  constructor(tenantDatabase, { maker, stockCorrectionId, updateFormDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.stockCorrectionId = stockCorrectionId;
    this.updateFormDto = updateFormDto;
  }

  async call() {
    const currentDate = new Date(Date.now());
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: { id: this.stockCorrectionId },
      include: [
        { model: this.tenantDatabase.Form, as: 'form' },
        { model: this.tenantDatabase.StockCorrectionItem, as: 'items' },
        { model: this.tenantDatabase.Warehouse, as: 'warehouse' },
      ],
    });
    const { form } = stockCorrection;
    validate(form, this.maker);

    await deleteJournal(this.tenantDatabase, form);
    await deleteInventory(this.tenantDatabase, form);
    await updateStockCorrectionForm({
      maker: this.maker,
      updateFormDto: this.updateFormDto,
      stockCorrection,
      currentDate,
      form,
    });
    await updateStockCorrectionItem(this.tenantDatabase, {
      stockCorrection,
      updateFormDto: this.updateFormDto,
    });

    await stockCorrection.reload();
    await sendEmailToApprover(this.tenantDatabase, stockCorrection);

    return { stockCorrection };
  }
}

function validate(form, maker) {
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden - Only maker can update the stock correction');
  }
}

async function updateStockCorrectionItem(tenantDatabase, { stockCorrection, updateFormDto }) {
  const { form: stockCorrectionForm, items: currentItems } = stockCorrection;
  const { items: updateItemsData } = updateFormDto;
  const doUpdateItem = updateItemsData.map(async (updateItem) => {
    const item = currentItems.find((currentItem) => {
      return currentItem.id === updateItem.stockCorrectionItemId;
    });
    const itemStock = await new GetCurrentStock(tenantDatabase, {
      item,
      date: stockCorrectionForm.date,
      warehouseId: stockCorrection.warehouse.id,
      options: {
        expiryDate: updateItem.expiryDate,
        productionNumber: updateItem.productionNumber,
      },
    }).call();
    if (itemStock + updateItem.stockCorrection < 0) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Stock can not be minus');
    }

    return item.update({
      quantity: updateItem.stockCorrection,
      unit: updateItem.unit,
      converter: updateItem.converter,
      notes: updateItem.notes,
      allocationId: updateItem.allocationId,
      ...(updateItem.expiryDate && { expiryDate: updateItem.expiryDate }),
      ...(updateItem.productionNumber && { productionNumber: updateItem.productionNumber }),
    });
  });

  await Promise.all(doUpdateItem);
}

async function updateStockCorrectionForm({ maker, updateFormDto, form }) {
  const formData = await buildFormData({ maker, updateFormDto });
  await form.update(formData);
  await form.reload();

  return form;
}

async function buildFormData({ maker, updateFormDto }) {
  const { notes, requestApprovalTo } = updateFormDto;

  return {
    date: new Date(),
    notes,
    updatedBy: maker.id,
    requestApprovalTo,
    done: false,
    approvalStatus: 0,
    approvalReason: null,
    cancellationStatus: null,
    requestCancellationTo: null,
  };
}

async function deleteJournal(tenantDatabase, form) {
  await tenantDatabase.Journal.destroy({ where: { formId: form.id } });
}

function deleteInventory(tenantDatabase, form) {
  return tenantDatabase.Inventory.destroy({ where: { formId: form.id } });
}

async function sendEmailToApprover(tenantDatabase, stockCorrection) {
  const tenantName = tenantDatabase.sequelize.config.database.replace('point_', '');
  await new ProcessSendUpdateApprovalWorker({
    tenantName,
    stockCorrectionId: stockCorrection.id,
  }).call();
}

module.exports = UpdateForm;
