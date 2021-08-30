const { SalesInvoice } = require('../../../models').tenant;

module.exports = async function createRejectSalesInvoice(salesInvoiceId) {
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  salesInvoice.form.update({
    approvalStatus: -1,
  });

  return salesInvoice;
};
