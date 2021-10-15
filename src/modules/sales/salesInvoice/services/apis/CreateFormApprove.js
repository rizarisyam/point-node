const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class CreateFormApprove {
  constructor(tenantDatabase, { approver, salesInvoiceId }) {
    this.tenantDatabase = tenantDatabase;
    this.approver = approver;
    this.salesInvoiceId = salesInvoiceId;
  }

  async call() {
    const salesInvoice = await this.tenantDatabase.SalesInvoice.findOne({
      where: { id: this.salesInvoiceId },
      include: generateSalesInvoiceIncludes(this.tenantDatabase),
    });
    if (!salesInvoice) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Sales invoice is not exist');
    }
    const form = await salesInvoice.getForm();
    validate(form, this.approver);
    if (form.approvalStatus === 1) {
      return { salesInvoice };
    }

    await updateJournal(this.tenantDatabase, { salesInvoice, form });
    await updateStock(this.tenantDatabase, { salesInvoice, form });

    await form.update({
      approvalStatus: 1,
      approvalBy: this.approver.id,
      approvalAt: new Date(),
    });

    await salesInvoice.reload();
    return { salesInvoice };
  }
}

function validate(form, approver) {
  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (form.approvalStatus === -1) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Sales invoice already rejected');
  }
}

function generateSalesInvoiceIncludes(tenantDatabase) {
  return [
    {
      model: tenantDatabase.SalesInvoiceItem,
      as: 'items',
      include: [{ model: tenantDatabase.Item, as: 'item' }],
    },
    { model: tenantDatabase.Form, as: 'form' },
  ];
}

async function updateJournal(tenantDatabase, { salesInvoice, form }) {
  await createJournalAccountReceivable(tenantDatabase, { salesInvoice, form });
  await createJournalSalesIncome(tenantDatabase, { salesInvoice, form });
  await createJournalInventoriesAndCogs(tenantDatabase, { salesInvoice, form });
  await createJournalTaxPayable(tenantDatabase, { salesInvoice, form });
}

async function createJournalAccountReceivable(tenantDatabase, { salesInvoice, form }) {
  const settingJournal = await getSettingJournal(tenantDatabase, { feature: 'sales', name: 'account receivable' });
  await tenantDatabase.Journal.create({
    formId: form.id,
    journalableType: 'Customer',
    journalableId: salesInvoice.customerId,
    chartOfAccountId: settingJournal.chartOfAccountId,
    debit: salesInvoice.remaining,
  });
}

async function createJournalSalesIncome(tenantDatabase, { salesInvoice, form }) {
  const settingJournal = await getSettingJournal(tenantDatabase, { feature: 'sales', name: 'sales income' });
  await tenantDatabase.Journal.create({
    formId: form.id,
    chartOfAccountId: settingJournal.chartOfAccountId,
    credit: salesInvoice.amount - salesInvoice.tax,
  });
}

async function createJournalInventoriesAndCogs(tenantDatabase, { salesInvoice, form }) {
  const creations = salesInvoice.items.map(async (salesInvoiceItem) => {
    const cogs = await salesInvoiceItem.item.calculateCogs();

    await tenantDatabase.Journal.create({
      formId: form.id,
      journalableType: 'Item',
      journalableId: salesInvoiceItem.itemId,
      chartOfAccountId: salesInvoiceItem.item.chartOfAccountId,
      credit: cogs * salesInvoiceItem.quantity,
    });

    await tenantDatabase.Journal.create({
      formId: form.id,
      journalableType: 'Item',
      journalableId: salesInvoiceItem.itemId,
      chartOfAccountId: salesInvoiceItem.item.chartOfAccountId,
      debit: cogs * salesInvoiceItem.quantity,
    });
  });

  await Promise.all(creations);
}

async function createJournalTaxPayable(tenantDatabase, { salesInvoice, form }) {
  const settingJournal = await getSettingJournal(tenantDatabase, { feature: 'sales', name: 'income tax payable' });
  await tenantDatabase.Journal.create({
    formId: form.id,
    chartOfAccountId: settingJournal.chartOfAccountId,
    credit: salesInvoice.tax,
  });
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

async function updateStock(tenantDatabase, { salesInvoice, form }) {
  const salesInvoiceItems = salesInvoice.items;
  const updateItemsStock = salesInvoiceItems.map(async (salesInvoiceItem) => {
    const item = await salesInvoiceItem.getItem();
    const totalQuantityItem = item.quantity * item.converter;

    return item.update({
      stock: item.stock - totalQuantityItem,
    });
  });

  await Promise.all([...updateItemsStock, updateInventory(tenantDatabase, { salesInvoice, form })]);
}

async function updateInventory(tenantDatabase, { salesInvoice, form }) {
  const salesInvoiceItems = salesInvoice.items;
  const doUpdateInventory = salesInvoiceItems.map(async (salesInvoiceItem) => {
    if (salesInvoiceItems.quantity === 0) {
      return;
    }
    const item = await salesInvoiceItem.getItem();
    const reference = await salesInvoice.getReferenceable();
    const warehouse = await reference.getWarehouse();

    return tenantDatabase.Inventory.create({
      formId: form.id,
      warehouseId: warehouse.id,
      itemId: item.id,
      quantity: parseFloat(salesInvoiceItem.quantity) * parseFloat(salesInvoiceItem.converter) * -1,
      quantityReference: parseFloat(salesInvoiceItem.quantity) * -1,
      unitReference: salesInvoiceItem.unit,
      converterReference: parseFloat(salesInvoiceItem.converter),
    });
  });

  await Promise.all(doUpdateInventory);
}

module.exports = CreateFormApprove;
