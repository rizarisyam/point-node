const { SalesInvoice } = require('../../../../models').tenant;

module.exports = async function updateFormSalesInvoice(maker, formId, updateFormSalesInvoiceDto) {
  const form = await SalesInvoice.findOne({ where: { id: formId } });
  form.update(updateFormSalesInvoiceDto);

  return form;
};
