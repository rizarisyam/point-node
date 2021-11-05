const httpStatus = require('http-status');
let { SalesInvoice, Form, SalesInvoiceItem, Journal, Inventory } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function updateFormSalesInvoice({
  currentTenantDatabase,
  maker,
  salesInvoiceId,
  updateFormSalesInvoiceDto,
}) {
  setTenantDatabase(currentTenantDatabase);
  const currentDate = new Date(Date.now());
  const salesInvoice = await SalesInvoice.findOne({
    where: { id: salesInvoiceId },
    include: [
      { model: Form, as: 'form' },
      { model: SalesInvoiceItem, as: 'items' },
    ],
  });
  const { form } = salesInvoice;
  validate(form, maker);

  await deleteJournal(form);
  await restoreStock(salesInvoice, form);
  await updateSalesInvoice(salesInvoice, updateFormSalesInvoiceDto);
  await updateSalesInvoiceForm({
    maker,
    updateFormSalesInvoiceDto,
    salesInvoice,
    currentDate,
    form,
  });

  return { salesInvoice };
};

function validate(form, maker) {
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function updateSalesInvoice(salesInvoice, updateFormSalesInvoiceDto) {
  const salesInvoiceData = await buildSalesInvoiceData(salesInvoice, updateFormSalesInvoiceDto);
  await salesInvoice.update(salesInvoiceData);
  await salesInvoice.reload();

  return salesInvoice;
}

async function buildSalesInvoiceData(salesInvoice, updateFormSalesInvoiceDto) {
  const { dueDate, typeOfTax, items: updateItems, discountPercent, discountValue } = updateFormSalesInvoiceDto;
  const { items: currentItems } = salesInvoice;

  const doUpdateItem = updateItems.map((updateItem) => {
    const item = currentItems.find((currentItem) => {
      return currentItem.id === updateItem.salesInvoiceItemId;
    });

    return item.update({
      discountPercent: updateItem.discountPercent,
      discountValue: updateItem.discountValue,
    });
  });

  await Promise.all(doUpdateItem);

  const items = await salesInvoice.getItems();
  const subTotal = getSubTotal(items);
  const taxBase = getTaxBase(subTotal, discountValue, discountPercent);
  const tax = getTax(taxBase, typeOfTax);
  const amount = getAmount(taxBase, tax, typeOfTax);

  return {
    dueDate,
    discountPercent,
    discountValue,
    tax,
    typeOfTax,
    amount,
    remaining: amount,
  };
}

function getSubTotal(items) {
  const subTotal = items.reduce((result, item) => {
    return result + getItemsPrice(item);
  }, 0);

  return subTotal;
}

function getItemsPrice(item) {
  let perItemPrice = item.price;
  if (item.discountValue > 0) {
    perItemPrice -= item.discountValue;
  }
  if (item.discountPercent > 0) {
    const discountPercent = item.discountPercent / 100;
    perItemPrice -= perItemPrice * discountPercent;
  }
  const totalItemPrice = perItemPrice * item.quantity;

  return totalItemPrice;
}

function getTaxBase(subTotal, discountValue, discountPercent) {
  if (discountValue > 0) {
    return subTotal - discountValue;
  }

  if (discountPercent > 0) {
    return subTotal - subTotal * (discountPercent / 100);
  }

  return subTotal;
}

function getTax(taxBase, typeOfTax) {
  if (typeOfTax === 'include') {
    return (taxBase * 10) / 110;
  }

  if (typeOfTax === 'exclude') {
    return taxBase * 0.1;
  }

  return 0;
}

function getAmount(taxBase, tax, typeOfTax) {
  if (typeOfTax === 'exclude') {
    return taxBase + tax;
  }

  return taxBase;
}

async function updateSalesInvoiceForm({ maker, updateFormSalesInvoiceDto, form }) {
  const formData = await buildFormData({ maker, updateFormSalesInvoiceDto });
  await form.update(formData);
  await form.reload();

  return form;
}

async function buildFormData({ maker, updateFormSalesInvoiceDto }) {
  const { notes, requestApprovalTo } = updateFormSalesInvoiceDto;

  return {
    date: new Date(),
    notes,
    updatedBy: maker.id,
    requestApprovalTo,
    done: false,
    approvalStatus: 0,
    cancellationStatus: null,
    requestCancellationTo: null,
  };
}

async function deleteJournal(form) {
  await Journal.destroy({ where: { formId: form.id } });
}

async function restoreStock(salesInvoice, form) {
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

  await Promise.all([...updateItemsStock, deleteInventory(form)]);
}

function deleteInventory(form) {
  return Inventory.destroy({ where: { formId: form.id } });
}

function setTenantDatabase(currentTenantDatabase) {
  ({ SalesInvoice, Form, SalesInvoiceItem, Journal, Inventory } = currentTenantDatabase);
}
