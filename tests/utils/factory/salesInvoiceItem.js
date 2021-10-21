const { SalesInvoiceItem } = require('@src/models').tenant;

async function create({ salesInvoice, deliveryNote, deliveryNoteItem, item, allocation }) {
  const salesInvoiceItem = await SalesInvoiceItem.create({
    salesInvoiceId: salesInvoice.id,
    deliveryNoteId: deliveryNote.id,
    deliveryNoteItemId: deliveryNoteItem.id,
    itemId: item.id,
    itemName: item.name,
    quantity: 10,
    price: 10000,
    unit: 'pcs',
    converter: 1,
    allocationId: allocation.id,
  });

  return salesInvoiceItem;
}

module.exports = { create };
