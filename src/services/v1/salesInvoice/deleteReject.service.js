const { SalesInvoice } = require('../../../models').tenant;

module.exports = async function deleteApproveSalesInvoice(salesInvoiceId, deleteApproveSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.form.update({
    cancellationStatus: -1,
    cancellationApprovalReason: deleteApproveSalesInvoiceDto.cancellationApprovalReason,
    cancellationApprovalAt: new Date(),
  });
};
