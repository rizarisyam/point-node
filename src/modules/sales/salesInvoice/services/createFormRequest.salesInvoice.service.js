/**
 * This service has responsibility to create Form Sales Invoice and Sales Invoice itself
 * This service must be triggered by maker that has permission "create sales invoice".
 */

const httpStatus = require('http-status');
const { SalesInvoice, Form } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

/**
 * Create Sales Invoice
 * @param {string} maker
 * @param {object} createSalesInvoiceDto
 * @returns {Promise}
 */
module.exports = async function createFormRequestSalesInvoice(maker, createSalesInvoiceDto) {
  if (!maker.isPermitted(['create sales invoice'])) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  const salesInvoice = await SalesInvoice.create(createSalesInvoiceDto.salesInvoice);
  await Form.create({
    formableId: salesInvoice.id,
    formableType: 'SalesInvoice',
    requestApprovalTo: createSalesInvoiceDto.requestApprovalTo,
  });

  return salesInvoice;
};
