const { SalesInvoice } = require('../../../../models').tenant;

module.exports = async function createApproveSalesInvoice(salesInvoiceId, createApproveSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.form.update({
    approvalStatus: 1,
    approvalBy: createApproveSalesInvoiceDto.approvalBy,
    approvalReason: createApproveSalesInvoiceDto.approvalReason,
    approvalAt: new Date(),
  });

  return salesInvoice;
};
