const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const ProcessSendApprovalWorker = require('../../workers/ProcessSendApproval.worker');

class CreateFormRequest {
  constructor(tenantDatabase, { maker, createFormRequestDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.createFormRequestDto = createFormRequestDto;
  }

  async call() {
    const currentDate = new Date(Date.now());
    const { formId: formReferenceId } = this.createFormRequestDto;
    const formReference = await this.tenantDatabase.Form.findOne({ where: { id: formReferenceId, done: false } });
    if (!formReference) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Form reference without done status not found');
    }
    const reference = await getReference(formReference);

    await validate(this.tenantDatabase, { maker: this.maker, formReference, reference });

    const salesInvoice = await createSalesInvoice(this.tenantDatabase, {
      reference,
      createFormRequestDto: this.createFormRequestDto,
    });
    const salesInvoiceForm = await createSalesInvoiceForm(this.tenantDatabase, {
      maker: this.maker,
      formReference,
      createFormRequestDto: this.createFormRequestDto,
      salesInvoice,
      currentDate,
    });

    await formReference.update({ done: true });

    const tenantName = this.tenantDatabase.sequelize.config.database.replace('point_', '');
    const sendApprovalEmail = new ProcessSendApprovalWorker({ tenantName, salesInvoiceId: salesInvoice.id });
    sendApprovalEmail.call();

    return { salesInvoiceForm, salesInvoice };
  }
}

async function getReference(formReference) {
  let reference;
  if (formReference.number.startsWith('DN')) {
    reference = await formReference.getFormable();
  } else if (formReference.number.startsWith('SV')) {
    reference = await formReference.getSalesVisitation();
  }

  return reference;
}

async function validate(tenantDatabase, { maker, formReference, reference }) {
  if (!formReference.number.startsWith('SV')) {
    await validateBranchDefaultPermission(tenantDatabase, { maker, formReference });
  }
  await validateWarehouseDefaultPermission(tenantDatabase, { maker, reference });
}

async function validateBranchDefaultPermission(tenantDatabase, { maker, formReference }) {
  const branchUser = await tenantDatabase.BranchUser.findOne({
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

async function validateWarehouseDefaultPermission(tenantDatabase, { maker, reference }) {
  const userWarehouse = await tenantDatabase.UserWarehouse.findOne({
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

async function createSalesInvoice(tenantDatabase, { reference, createFormRequestDto }) {
  const salesInvoiceData = await buildSalesInvoiceData(tenantDatabase, { reference, createFormRequestDto });
  const salesInvoice = await tenantDatabase.SalesInvoice.create(salesInvoiceData);
  await addSalesInvoiceItems(tenantDatabase, { salesInvoice, reference, createFormRequestDto });

  return salesInvoice;
}

async function buildSalesInvoiceData(tenantDatabase, { reference, createFormRequestDto }) {
  const { dueDate, typeOfTax, customerId, items, discountPercent, discountValue } = createFormRequestDto;

  const subTotal = getSubTotal(items);
  const taxBase = getTaxBase({ subTotal, discountValue, discountPercent });
  const tax = getTax(taxBase, typeOfTax);
  const amount = getAmount({ taxBase, tax, typeOfTax });
  const customer = await getCustomer(tenantDatabase, customerId);

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
    customerAddress: customer.address || '',
    customerPhone: customer.phone || '',
    referenceableId: reference.id,
    referenceableType: reference.getMorphType(),
  };
}

async function addSalesInvoiceItems(tenantDatabase, { salesInvoice, reference, createFormRequestDto }) {
  const { items: itemPayloads } = createFormRequestDto;
  const salesInvoiceItems = await Promise.all(
    itemPayloads.map(async (itemPayload) => {
      await createSalesInvoiceItem(tenantDatabase, { salesInvoice, reference, itemPayload });
    })
  );

  return salesInvoiceItems;
}

async function createSalesInvoiceItem(tenantDatabase, { salesInvoice, reference, itemPayload }) {
  let referenceItem;
  switch (reference.constructor.name) {
    case 'DeliveryNote':
      referenceItem = await tenantDatabase.DeliveryNoteItem.findOne({
        where: {
          id: itemPayload.referenceItemId,
        },
      });
      break;
    case 'SalesVisitation':
      referenceItem = await tenantDatabase.SalesVisitationDetail.findOne({
        where: {
          id: itemPayload.referenceItemId,
        },
      });
      break;
    default:
  }
  const item = await referenceItem.getItem();
  const itemUnit = await tenantDatabase.ItemUnit.findOne({ where: { name: itemPayload.itemUnit } });
  if (!itemUnit) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Item unit ${itemPayload.itemUnit} not found`);
  }

  return tenantDatabase.SalesInvoiceItem.create({
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
    allocationId: itemPayload?.allocationId,
  });
}

async function createSalesInvoiceForm(
  tenantDatabase,
  { maker, formReference, createFormRequestDto, salesInvoice, currentDate }
) {
  const formData = await buildFormData(tenantDatabase, {
    maker,
    formReference,
    createFormRequestDto,
    salesInvoice,
    currentDate,
  });
  const form = await tenantDatabase.Form.create(formData);

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

function getTaxBase({ subTotal, discountValue, discountPercent }) {
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

function getAmount({ taxBase, tax, typeOfTax }) {
  if (typeOfTax === 'exclude') {
    return taxBase + tax;
  }

  return taxBase;
}

async function getCustomer(tenantDatabase, customerId) {
  const customer = await tenantDatabase.Customer.findOne({ where: { id: customerId } });

  return customer;
}

async function buildFormData(tenantDatabase, { maker, formReference, createFormRequestDto, salesInvoice, currentDate }) {
  const { notes, requestApprovalTo } = createFormRequestDto;
  const { incrementNumber, incrementGroup } = await getFormIncrement(tenantDatabase, currentDate);
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

async function getFormIncrement(tenantDatabase, currentDate) {
  const incrementGroup = `${currentDate.getFullYear()}${getMonthFormattedString(currentDate)}`;
  const lastForm = await tenantDatabase.Form.findOne({
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

module.exports = CreateFormRequest;
