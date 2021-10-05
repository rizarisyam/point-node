let { SalesInvoice, SalesInvoiceItem, Form, Customer, User } = require('@src/models').tenant;

module.exports = async function getOneSalesInvoice({ currentTenantDatabase, salesInvoiceId }) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({
    where: {
      id: salesInvoiceId,
    },
    include: [
      { model: SalesInvoiceItem, as: 'items' },
      {
        model: Form,
        as: 'form',
        include: [
          { model: User, as: 'requestApprovalToUser' },
          { model: User, as: 'createdByUser' },
        ],
      },
      { model: Customer, as: 'customer' },
    ],
  });
  parseSalesInvoiceNumberStringToFLoat(salesInvoice);
  const referenceable = await salesInvoice.getReferenceable({ include: [{ model: Form, as: 'form' }] });
  salesInvoice.dataValues.referenceable = referenceable;

  return { salesInvoice };
};

function parseSalesInvoiceNumberStringToFLoat(salesInvoice) {
  salesInvoice.amount = parseFloat(salesInvoice.amount);
  salesInvoice.discountPercent = parseFloat(salesInvoice.discountPercent);
  salesInvoice.discountValue = parseFloat(salesInvoice.discountValue);
  salesInvoice.remaining = parseFloat(salesInvoice.remaining);
  salesInvoice.tax = parseFloat(salesInvoice.tax);

  salesInvoice.items.forEach((item) => {
    item.price = parseFloat(item.price);
    item.quantity = parseFloat(item.quantity);
    item.discountPercent = parseFloat(item.discountPercent);
    item.discountValue = parseFloat(item.discountValue);
  });
}

function setTenantDatabase(currentTenantDatabase) {
  ({ SalesInvoice, SalesInvoiceItem, Form, Customer, User } = currentTenantDatabase);
}
