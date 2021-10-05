const httpStatus = require('http-status');
let { SalesInvoice, SalesInvoiceItem, Item, Journal, SettingJournal } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function createFormApproveSalesInvoice({ currentTenantDatabase, approver, salesInvoiceId }) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({
    where: { id: salesInvoiceId },
    include: genereateSalesInvoiceIncludes(),
  });
  const form = await salesInvoice.getForm();

  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (form.approvalStatus !== 0) {
    return { salesInvoice };
  }

  await updateJournal(salesInvoice, form);
  await updateStock(salesInvoice.items);

  const updatedForm = await form.update({
    approvalStatus: 1,
    approvalBy: approver.id,
    approvalAt: new Date(),
  });
  salesInvoice.dataValues.form = updatedForm;

  return { salesInvoice };
};

function genereateSalesInvoiceIncludes() {
  return [
    {
      model: SalesInvoiceItem,
      as: 'items',
      include: [{ model: Item, as: 'item' }],
    },
  ];
}

async function updateJournal(salesInvoice, form) {
  await createJournalAccountReceivable(salesInvoice, form);
  await createJournalSalesIncome(salesInvoice, form);
  await createJournalInventoriesAndCogs(salesInvoice, form);
  await createJournalTaxPayable(salesInvoice, form);
}

async function createJournalAccountReceivable(salesInvoice, form) {
  const settingJournal = await getSettingJournal('sales', 'account receivable');
  await Journal.create({
    formId: form.id,
    journalableType: 'Customer',
    journalableId: salesInvoice.customerId,
    chartOfAccountId: settingJournal.chartOfAccountId,
    debit: salesInvoice.remaining,
  });
}

async function createJournalSalesIncome(salesInvoice, form) {
  const settingJournal = await getSettingJournal('sales', 'sales income');
  await Journal.create({
    formId: form.id,
    chartOfAccountId: settingJournal.chartOfAccountId,
    credit: salesInvoice.amount - salesInvoice.tax,
  });
}

async function createJournalInventoriesAndCogs(salesInvoice, form) {
  const creations = salesInvoice.items.map(async (salesInvoiceItem) => {
    const cogs = await salesInvoiceItem.item.calculateCogs();

    await Journal.create({
      formId: form.id,
      journalableType: 'Item',
      journalableId: salesInvoiceItem.itemId,
      chartOfAccountId: salesInvoiceItem.item.chartOfAccountId,
      credit: cogs * salesInvoiceItem.quantity,
    });

    await Journal.create({
      formId: form.id,
      journalableType: 'Item',
      journalableId: salesInvoiceItem.itemId,
      chartOfAccountId: salesInvoiceItem.item.chartOfAccountId,
      debit: cogs * salesInvoiceItem.quantity,
    });
  });

  await Promise.all(creations);
}

async function createJournalTaxPayable(salesInvoice, form) {
  const settingJournal = await getSettingJournal('sales', 'income tax payable');
  await Journal.create({
    formId: form.id,
    chartOfAccountId: settingJournal.chartOfAccountId,
    credit: salesInvoice.tax,
  });
}

async function getSettingJournal(feature, name) {
  const settingJournal = await SettingJournal.findOne({
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

async function updateStock(salesInvoiceItems) {
  const updateItemsStock = salesInvoiceItems.map(async (salesInvoiceItem) => {
    const item = await salesInvoiceItem.getItem();
    const totalQuantityItem = item.quantity * item.converter;

    return item.update({
      stock: item.stock - totalQuantityItem,
    });
  });

  await Promise.all(updateItemsStock);
}

function setTenantDatabase(currentTenantDatabase) {
  ({ SalesInvoice, SalesInvoiceItem, Item, Journal, SettingJournal } = currentTenantDatabase);
}
