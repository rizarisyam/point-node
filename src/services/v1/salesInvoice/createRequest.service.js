const { SalesInvoice, Form } = require('../../../models').tenant;

module.exports = async function createSalesInvoice(createSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.create(createSalesInvoiceDto.salesInvoice);
  await Form.create({
    formableId: salesInvoice.id,
    formableType: 'SalesInvoice',
    requestApprovalTo: createSalesInvoiceDto.requestApprovalTo,
  });

  return salesInvoice;
};
