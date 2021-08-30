const setupTestDb = require('../../../../utils/setupTestDB');
const { Customer } = require('../../../../../src/models');
const updateSalesInvoice = require('../../../../../src/services/v1/salesInvoice/update.service');

setupTestDb();

describe('updateSalesInvoice service', () => {
  let salesInvoice;
  let customer;
  beforeEach(async () => {
    customer = await Customer.create({});
    salesInvoice = await salesInvoice.create({ customerId: customer.id });
  });

  describe('validation', () => {
    const updateSalesInvoiceDto = {
      amount: 100000,
    };

    it('should throw error if salesInvoice is already approved', async () => {
      salesInvoice.form.update({
        approvalStatus: 1,
      });
      await expect(updateSalesInvoice(updateSalesInvoiceDto)).rejects.toThrow();
    });

    it('should throw error if salesInvoice is already rejected', async () => {
      salesInvoice.form.update({
        approvalStatus: -1,
      });
      await expect(updateSalesInvoice(updateSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success updating', () => {
    const updateSalesInvoiceDto = {
      amount: 100000,
    };

    beforeEach(async () => {
      salesInvoice = await updateSalesInvoice(salesInvoice.id, updateSalesInvoiceDto);
    });

    it('has correct customer data', () => {
      expect(salesInvoice.customerId).toEqual(customer.id);
      expect(salesInvoice.customerName).toEqual(customer.name);
      expect(salesInvoice.customerAddress).toEqual(customer.address);
    });

    it('has correct sales invoice items data', async () => {
      const salesInvoiceItems = await salesInvoice.items;
      expect(salesInvoiceItems.length).toEqual(0);
    });

    it('has correct sales invoice data', () => {
      expect(salesInvoice.typeOfTax).toEqual('non');
      expect(salesInvoice.tax).toEqual(0);
      expect(salesInvoice.amount).toEqual(0);
      expect(salesInvoice.remaining).toEqual(0);
    });
  });
});
