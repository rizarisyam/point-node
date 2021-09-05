/**
 * This service has responsibility to reject created Sales Invoice.
 * This service must be triggered by user that has permission "delete sales invoice".
 */

const { Form } = require('@src/models').tenant;

module.exports = async function createFormRejectSalesInvoice(approver, formId, createFormRejectSalesInvoiceDto) {
  const formSalesInvoice = await Form.findOne({ where: { id: formId } });
  formSalesInvoice.update({
    approvalStatus: -1,
  });

  return formSalesInvoice;
};
