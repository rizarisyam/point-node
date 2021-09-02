const setupTestDbTenant = require('../../../../../tests/utils/setupTestDbTenant');
const { Customer } = require('../../../../models');
const createSalesInvoice = require('./createRequest.service');

setupTestDbTenant();

describe('createSalesInvoice service', () => {
  describe('validation', () => {
    it('should throw error if customer id not valid', async () => {
      const createSalesInvoiceDto = {
        customerId: 'invalid-customer-id',
      };
      await expect(createSalesInvoice(createSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success creating', () => {
    const createSalesInvoiceDto = {
      items: [],
    };
    let salesInvoice;
    let customer;
    beforeEach(async () => {
      customer = await Customer.create({});
      createSalesInvoiceDto.customerId = customer.id;
      salesInvoice = await createSalesInvoice(createSalesInvoiceDto);
    });

    it('has correct customer data', () => {
      expect(salesInvoice.customerId).toEqual(customer.id);
      expect(salesInvoice.customerName).toEqual(customer.name);
      expect(salesInvoice.customerAddress).toEqual(customer.address);
    });

    it('has correct form data', () => {
      // SI + nomor urut form (001) + bulan created form (07) + tahun created form (21)
      expect(salesInvoice.form).toBeDefined();
      expect(salesInvoice.form.number).toEqual('SI0010721');
      expect(salesInvoice.form.approvalStatus).toEqual(0); // pending
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
