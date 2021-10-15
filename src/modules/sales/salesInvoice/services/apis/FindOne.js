class FindOne {
  constructor(tenantDatabase, salesInvoiceId) {
    this.tenantDatabase = tenantDatabase;
    this.salesInvoiceId = salesInvoiceId;
  }

  async call() {
    const salesInvoice = await this.tenantDatabase.SalesInvoice.findOne({
      where: {
        id: this.salesInvoiceId,
      },
      include: [
        { model: this.tenantDatabase.SalesInvoiceItem, as: 'items' },
        {
          model: this.tenantDatabase.Form,
          as: 'form',
          include: [
            { model: this.tenantDatabase.User, as: 'requestApprovalToUser' },
            { model: this.tenantDatabase.User, as: 'createdByUser' },
          ],
        },
        { model: this.tenantDatabase.Customer, as: 'customer' },
      ],
    });
    parseSalesInvoiceNumberStringToFLoat(salesInvoice);
    const referenceable = await salesInvoice.getReferenceable({
      include: [{ model: this.tenantDatabase.Form, as: 'form' }],
    });
    salesInvoice.dataValues.referenceable = referenceable;

    return { salesInvoice };
  }
}

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

module.exports = FindOne;
