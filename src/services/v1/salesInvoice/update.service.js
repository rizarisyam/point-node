const { SalesInvoice } = require('../../../models').tenant;

module.exports = async function updateSalesInvoice(salesInvoiceId, updateSalesInvoiceDto) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.update(updateSalesInvoiceDto);

  return salesInvoice;
};
