const { SalesInvoice } = require('@src/models').tenant;

module.exports = async function createFormApproveSalesInvoice(salesInvoiceId, createFormApproveSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.form.update({
    approvalStatus: 1,
    approvalBy: createFormApproveSalesInvoiceDto.approvalBy,
    approvalReason: createFormApproveSalesInvoiceDto.approvalReason,
    approvalAt: new Date(),
  });

  return salesInvoice;
};
