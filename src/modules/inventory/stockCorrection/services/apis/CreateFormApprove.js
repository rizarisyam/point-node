const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const InsertInventoryRecord = require('@src/modules/inventory/services/InsertInventoryRecord');

class CreateFormApprove {
  constructor(tenantDatabase, { approver, stockCorrectionId }) {
    this.tenantDatabase = tenantDatabase;
    this.approver = approver;
    this.stockCorrectionId = stockCorrectionId;
  }

  async call() {
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: { id: this.stockCorrectionId },
      include: [
        {
          model: this.tenantDatabase.StockCorrectionItem,
          as: 'items',
          include: [{ model: this.tenantDatabase.Item, as: 'item' }],
        },
        { model: this.tenantDatabase.Form, as: 'form' },
      ],
    });
    if (!stockCorrection) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction is not exist');
    }

    const { form: stockCorrectionForm } = stockCorrection;
    validate(stockCorrectionForm, this.approver);
    if (stockCorrectionForm.approvalStatus === 1) {
      return { stockCorrection };
    }

    await this.tenantDatabase.sequelize.transaction(async (transaction) => {
      await updateInventory(this.tenantDatabase, { stockCorrection, stockCorrectionForm, transaction });
      await updateJournal(this.tenantDatabase, { stockCorrection, stockCorrectionForm, transaction });
      await stockCorrectionForm.update(
        {
          approvalStatus: 1,
          approvalBy: this.approver.id,
          approvalAt: new Date(),
        },
        { transaction }
      );
    });

    await stockCorrection.reload();
    return { stockCorrection };
  }
}

function validate(stockCorrectionForm, approver) {
  if (stockCorrectionForm.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (stockCorrectionForm.approvalStatus === -1) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Stock correction already rejected');
  }
}

async function updateInventory(tenantDatabase, { transaction, stockCorrection, stockCorrectionForm }) {
  const stockCorrectionItems = stockCorrection.items;
  const doUpdateInventory = stockCorrectionItems.map(async (stockCorrectionItem) => {
    if (stockCorrectionItems.quantity === 0) {
      return;
    }
    const item = await stockCorrectionItem.getItem();
    const warehouse = await stockCorrection.getWarehouse();
    const quantity = Math.abs(stockCorrectionItem.quantity) * -1;

    return new InsertInventoryRecord(tenantDatabase, {
      form: stockCorrectionForm,
      warehouse,
      item,
      quantity,
      unit: stockCorrectionItem.unit,
      converter: stockCorrectionItem.converter,
      options: {
        expiryDate: stockCorrectionItem.expiryDate,
        productionNumber: stockCorrectionItem.productionNumber,
      },
      transaction,
    }).call();
  });

  await Promise.all(doUpdateInventory);
}

async function updateJournal(tenantDatabase, { stockCorrection, stockCorrectionForm, transaction }) {
  const settingJournalDifferenceStockExpenses = await getSettingJournal(tenantDatabase, {
    feature: 'stock correction',
    name: 'difference stock expenses',
  });
  const creations = stockCorrection.items.map(async (stockCorrectionItem) => {
    const isDecrement = stockCorrectionItem.quantity < 0;
    const cogs = await stockCorrectionItem.item.calculateCogs();

    // stock
    await tenantDatabase.Journal.create(
      {
        formId: stockCorrectionForm.id,
        journalableType: 'Item',
        journalableId: stockCorrectionItem.itemId,
        chartOfAccountId: stockCorrectionItem.item.chartOfAccountId,
        ...(isDecrement ? { credit: cogs * stockCorrectionItem.quantity } : { debit: cogs * stockCorrectionItem.quantity }),
      },
      { transaction }
    );

    // difference stock expenses
    await tenantDatabase.Journal.create(
      {
        formId: stockCorrectionForm.id,
        journalableType: 'Item',
        journalableId: stockCorrectionItem.itemId,
        chartOfAccountId: settingJournalDifferenceStockExpenses.chartOfAccountId,
        ...(isDecrement ? { debit: cogs * stockCorrectionItem.quantity } : { credit: cogs * stockCorrectionItem.quantity }),
      },
      { transaction }
    );
  });

  await Promise.all(creations);
}

async function getSettingJournal(tenantDatabase, { feature, name }) {
  const settingJournal = await tenantDatabase.SettingJournal.findOne({
    where: {
      feature,
      name,
    },
  });

  if (!settingJournal) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, `Journal ${feature} account - ${name} not found`);
  }

  return settingJournal;
}

module.exports = CreateFormApprove;
