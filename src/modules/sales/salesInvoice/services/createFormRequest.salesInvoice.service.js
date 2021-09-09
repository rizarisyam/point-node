/**
 * This service has responsibility to create Form Sales Invoice and Sales Invoice itself
 * This service must be triggered by maker that has permission "create sales invoice".
 */

const httpStatus = require('http-status');
const { SalesInvoice, Form } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

let currentDate;

/**
 * Create Sales Invoice
 * @param {string} maker
 * @param {object} createSalesInvoiceDto
 * @returns {Promise}
 */
module.exports = async function createFormRequestSalesInvoice(maker, createSalesInvoiceDto) {
  currentDate = new Date();
  const { formId: formReferenceId } = createSalesInvoiceDto;
  const formReference = await Form.findBy({ where: { id: formReferenceId } });
  const salesInvoice = await SalesInvoice.create(createSalesInvoiceDto.salesInvoice);
  await Form.create({
    ...formData(maker, formReference, createSalesInvoiceDto),
  });

  return salesInvoice;
};

function formData(maker, formReference, createSalesInvoiceDto) {
  return {
    branchId: formReference.branchId,
    date: new Date(),
    number: generateFormNumber(),
  };
}

// SI + tahun created form (21) + bulan created form (07) + nomor urut form (001)
async function generateFormNumber() {
  const monthValue = getMonthValue();
  const yearValue = getYearValue();
  const orderNumber = await getFormQueueNumber();
  return `SI${yearValue}${monthValue}${orderNumber}`;
}

function getYearValue() {
  const fullYear = currentDate.getFullYear().toString();
  return fullYear.slice(-2);
}

function getMonthValue() {
  const month = currentDate.getMonth() + 1;
  return `0${month}`.slice(-2);
}

async function getFormQueueNumber() {
  const lastCreatedSalesInvoiceFormThisMonth = await Form.findBy({
    where: {
      formableType: 'SalesInvoice',
      createdAt: {
        $gte: new Date(`${currentDate.getFullYear()}-${getMonthValue()}-01`),
      },
    },
    order: [['createdAt', 'DESC']],
  });

  const lastCreatedOrderNumber = parseInt(lastCreatedSalesInvoiceFormThisMonth.number.slice(-3), 10);
  const orderNumber = lastCreatedOrderNumber + 1;
  return `000${orderNumber}`.slice(-3);
}
