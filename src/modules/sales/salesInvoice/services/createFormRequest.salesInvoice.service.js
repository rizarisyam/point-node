/**
 * This service has responsibility to create Form Sales Invoice and Sales Invoice itself
 * This service must be triggered by maker that has permission "create sales invoice".
 */

const httpStatus = require('http-status');
const { SalesInvoice, Form, Customer, BranchUser, UserWarehouse, SalesInvoiceItem, DeliveryNoteItem, ItemUnit } =
  require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

/**
 * Create Sales Invoice
 * @param {string} maker
 * @param {object} createSalesInvoiceDto
 * @returns {Promise}
 */
module.exports = async function createFormRequestSalesInvoice(maker, createSalesInvoiceDto) {
  const currentDate = new Date(Date.now());
  const { formId: formReferenceId } = createSalesInvoiceDto;
  const formReference = await Form.findOne({ where: { id: formReferenceId } });
  const reference = await formReference.getFormable();

  await validate(maker, formReference, reference);

  const salesInvoice = await createSalesInvoice(reference, createSalesInvoiceDto);
  const salesInvoiceForm = await createSalesInvoiceForm({
    maker,
    formReference,
    createSalesInvoiceDto,
    salesInvoice,
    currentDate,
  });

  return { salesInvoiceForm, salesInvoice };
};

async function validate(maker, formReference, reference) {
  await validateBranchDefaultPermission(maker, formReference);
  await validateWarehouseDefaultPermission(maker, reference);
}

async function validateBranchDefaultPermission(maker, formReference) {
  const branchUser = await BranchUser.findOne({
    where: {
      userId: maker.id,
      branchId: formReference.branchId,
      isDefault: true,
    },
  });
  if (!branchUser) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function validateWarehouseDefaultPermission(maker, reference) {
  const userWarehouse = await UserWarehouse.findOne({
    where: {
      userId: maker.id,
      warehouseId: reference.warehouseId,
      isDefault: true,
    },
  });
  if (!userWarehouse) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function createSalesInvoice(reference, createSalesInvoiceDto) {
  const salesInvoiceData = await buildSalesInvoiceData(createSalesInvoiceDto);
  const salesInvoice = await SalesInvoice.create(salesInvoiceData);
  await addSalesInvoiceItems(salesInvoice, reference, createSalesInvoiceDto);

  return salesInvoice;
}

async function buildSalesInvoiceData(createSalesInvoiceDto) {
  const { dueDate, typeOfTax, customerId, items, discountPercent, discountValue } = createSalesInvoiceDto;

  const subTotal = getSubTotal(items);
  const taxBase = getTaxBase(subTotal, discountValue, discountPercent);
  const tax = getTax(taxBase, typeOfTax);
  const amount = getAmount(taxBase, tax);
  const customer = await getCustomer(customerId);

  return {
    dueDate,
    discountPercent,
    discountValue,
    tax,
    typeOfTax,
    amount,
    remaining: amount,
    customerId,
    customerName: customer.name,
    customerAddress: customer.address,
    customerPhone: customer.phone,
  };
}

async function addSalesInvoiceItems(salesInvoice, reference, createSalesInvoiceDto) {
  const { items: itemPayloads } = createSalesInvoiceDto;
  const salesInvoiceItems = await Promise.all(
    itemPayloads.map(async (itemPayload) => {
      await createSalesInvoiceItem(salesInvoice, reference, itemPayload);
    })
  );

  return salesInvoiceItems;
}

async function createSalesInvoiceItem(salesInvoice, reference, itemPayload) {
  let referenceItem;
  switch (reference.constructor.name) {
    case 'DeliveryNote':
      referenceItem = await DeliveryNoteItem.findOne({
        where: {
          id: itemPayload.referenceItemId,
        },
      });
      break;
    default:
  }
  const item = await referenceItem.getItem();
  const itemUnit = await ItemUnit.findOne({ where: { id: itemPayload.itemUnitId } });

  return SalesInvoiceItem.create({
    salesInvoiceId: salesInvoice.id,
    deliveryNoteId: reference.id,
    deliveryNoteItemId: referenceItem.id,
    itemId: item.id,
    itemName: item.name,
    quantity: itemPayload.quantity,
    price: itemPayload.price,
    discountPercent: itemPayload.discountPercent,
    discountValue: itemPayload.discountValue,
    taxable: itemPayload.taxable,
    unit: itemUnit.label,
    converter: itemUnit.converter,
    // allocationId: itemPayload.allocationId,
  });
}

async function createSalesInvoiceForm({ maker, formReference, createSalesInvoiceDto, salesInvoice, currentDate }) {
  const formData = await buildFormData({ maker, formReference, createSalesInvoiceDto, salesInvoice, currentDate });
  const form = await Form.create(formData);

  return form;
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
    return (taxBase * 10) / 11;
  }

  if (typeOfTax === 'exclude') {
    return taxBase * 0.1;
  }

  return 0;
}

function getAmount(taxBase, tax) {
  return taxBase + tax;
}

async function getCustomer(customerId) {
  const customer = await Customer.findOne({ where: { id: customerId } });

  return customer;
}

async function buildFormData({ maker, formReference, createSalesInvoiceDto, salesInvoice, currentDate }) {
  const { notes, requestApprovalTo } = createSalesInvoiceDto;
  const { incrementNumber, incrementGroup } = await getFormIncrement(currentDate);
  const formNumber = generateFormNumber(currentDate, incrementNumber);

  return {
    branchId: formReference.branchId,
    date: new Date(),
    number: formNumber,
    notes,
    createdBy: maker.id,
    updatedBy: maker.id,
    incrementNumber,
    incrementGroup,
    formableId: salesInvoice.id,
    formableType: 'SalesInvoice',
    requestApprovalTo,
  };
}

async function getFormIncrement(currentDate) {
  const incrementGroup = `${currentDate.getFullYear()}${getMonthFormattedString(currentDate)}`;
  const lastForm = await Form.findOne({
    where: {
      formableType: 'SalesInvoice',
      incrementGroup,
    },
    order: [['increment', 'DESC']],
  });

  return {
    incrementGroup,
    incrementNumber: lastForm ? lastForm.incrementNumber + 1 : 1,
  };
}

function generateFormNumber(currentDate, incrementNumber) {
  // Form number format
  // SI + created year form (00) + created month form (00) + form increment (000)
  // 2021/12/01 -> SI2112001
  const monthValue = getMonthFormattedString(currentDate);
  const yearValue = getYearFormattedString(currentDate);
  const orderNumber = `000${incrementNumber}`.slice(-3);
  return `SI${yearValue}${monthValue}${orderNumber}`;
}

function getYearFormattedString(currentDate) {
  const fullYear = currentDate.getFullYear().toString();
  return fullYear.slice(-2);
}

function getMonthFormattedString(currentDate) {
  const month = currentDate.getMonth() + 1;
  return `0${month}`.slice(-2);
}
