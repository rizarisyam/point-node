/**
 * This service has responsibility to create Form Sales Invoice and Sales Invoice itself
 * This service must be triggered by maker that has permission "create sales invoice".
 */

const httpStatus = require('http-status');
const { SalesInvoice, Form, Customer, BranchUser, UserWarehouse } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

/**
 * Create Sales Invoice
 * @param {string} maker
 * @param {object} createSalesInvoiceDto
 * @returns {Promise}
 */
module.exports = async function createFormRequestSalesInvoice(maker, createSalesInvoiceDto) {
  const currentDate = new Date();
  const { formId: formReferenceId } = createSalesInvoiceDto;
  const formReference = await Form.findBy({ where: { id: formReferenceId } });

  await validate(maker, formReference);

  const salesInvoiceData = await buildSalesInvoiceData(createSalesInvoiceDto);
  const salesInvoice = await SalesInvoice.create(salesInvoiceData);
  const formData = await buildFormData({ maker, createSalesInvoiceDto, salesInvoice, currentDate });
  const form = await Form.create(formData);

  return { form, salesInvoice };
};

async function validate(maker, formReference) {
  await validateBranchDefaultPermission(maker, formReference);
  await validateWarehouseDefaultPermission(maker, formReference);
}

async function validateBranchDefaultPermission(maker, formReference) {
  const branchUser = await BranchUser.findOne({
    where: {
      userId: maker.id,
      branchId: formReference.id,
      isDefault: true,
    },
  });
  if (!branchUser) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

async function validateWarehouseDefaultPermission(maker, formReference) {
  const reference = formReference.getFormable();
  const userWarehouse = await UserWarehouse.findOne({
    where: {
      userId: maker.id,
      warehouseId: reference.warehouseId,
      isDefault: true,
    },
  });
  if (!userWarehouse) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }
}

async function buildSalesInvoiceData(createSalesInvoiceDto) {
  const { dueDate, discount: discountSalesInvoice, typeOfTax, notes, customerId, items, discount } = createSalesInvoiceDto;

  const subTotal = getSubTotal(items);
  const taxBase = getTaxBase(subTotal, discount);
  const tax = getTax(taxBase, typeOfTax);
  const amount = getAmount(taxBase, tax);
  const customer = await getCustomer();

  return {
    dueDate,
    discountPercent: discountSalesInvoice.percent,
    discountValue: discountSalesInvoice.value,
    taxBase,
    tax,
    typeOfTax,
    amount,
    notes,
    customerId,
    customerName: customer.name,
    customerAddress: customer.address,
    customerPhone: customer.phone,
  };
}

async function getSubTotal(items) {
  const subTotal = items.reduce(async (result, item) => {
    return result + getItemsPrice(item);
  }, 0);

  return subTotal;
}

function getItemsPrice(item) {
  const itemPrice = item.price * item.quantity;

  if (item.discount.value > 0) {
    return itemPrice - item.discount.value;
  }

  if (item.discount.percent > 0) {
    return itemPrice - itemPrice * item.discount.percent;
  }

  return itemPrice;
}

function getTaxBase(subTotal, discount) {
  if (discount.value > 0) {
    return subTotal - discount.value;
  }

  if (discount.percent > 0) {
    return subTotal - subTotal * discount.percent;
  }

  return subTotal;
}

function getTax(taxBase, typeOfTax) {
  if (typeOfTax === 'include') {
    return (taxBase * 1) / 110;
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
      order: [['increment', 'DESC']],
    },
  });

  return {
    incrementGroup,
    increment: lastForm.increment + 1,
  };
}

async function generateFormNumber(currentDate, incrementNumber) {
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
