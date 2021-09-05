const { Form } = require('../../../../models').tenant;

module.exports = async function deleteFormRequestSalesInvoice(maker, formId, deleteFormRequestSalesInvoiceDto) {
  const form = await Form.findOne({ where: { id: formId } });
  form.update({
    cancellationStatus: 0,
    requestCancellationBy: deleteFormRequestSalesInvoiceDto.requestCancellationBy,
    requestCancellationTo: deleteFormRequestSalesInvoiceDto.requestCancellationTo,
    requestCancellationReason: deleteFormRequestSalesInvoiceDto.requestCancellationReason,
    requestCancellationAt: new Date(),
  });
};
