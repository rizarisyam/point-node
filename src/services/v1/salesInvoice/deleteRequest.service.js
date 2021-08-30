const { SalesInvoice } = require('../../../models').tenant;

module.exports = async function requestDeleteSalesInvoice(salesInvoiceId, deleteSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.form.update({
    cancellationStatus: 0,
    requestCancellationBy: deleteSalesInvoiceDto.requestCancellationBy,
    requestCancellationTo: deleteSalesInvoiceDto.requestCancellationTo,
    requestCancellationReason: deleteSalesInvoiceDto.requestCancellationReason,
    requestCancellationAt: new Date(),
  });
};
