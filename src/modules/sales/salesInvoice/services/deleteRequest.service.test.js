const setupTestDbTenant = require('../../../../../tests/utils/setupTestDbTenant');
const { Customer, Form } = require('../../../../models');
const deleteRequestSalesInvoice = require('./deleteRequest.service');

setupTestDbTenant();

describe('deleteRequestSalesInvoice service', () => {
  let salesInvoice;
  let customer;
  beforeEach(async () => {
    customer = await Customer.create({});
    salesInvoice = await salesInvoice.create({ customerId: customer.id });
    await Form.create({ salesInvoiceId: salesInvoice.id, approvalStatus: 0 });
  });

  describe('validation', () => {
    const deleteRequestSalesInvoiceDto = {
      requestCancellationBy: 2,
      requestCancellationTo: 1,
      requestCancellationReason: 'example reason',
    };

    it('should throw error if salesInvoice is already approved', async () => {
      salesInvoice.form.update({
        approvalStatus: 1,
      });
      await expect(deleteRequestSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });

    it('should throw error if salesInvoice is already rejected', async () => {
      salesInvoice.form.update({
        approvalStatus: -1,
      });
      await expect(deleteRequestSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success request delete', () => {
    const deleteRequestSalesInvoiceDto = {
      requestCancellationBy: 2,
      requestCancellationTo: 1,
      requestCancellationReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteRequestSalesInvoice(salesInvoice.id, deleteRequestSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.requestCancellationBy).toEqual(deleteRequestSalesInvoiceDto.requestCancellationBy);
      expect(salesInvoice.form.requestCancellationTo).toEqual(deleteRequestSalesInvoiceDto.requestCancellationTo);
      expect(salesInvoice.form.requestCancellationReason).toEqual(deleteRequestSalesInvoiceDto.requestCancellationReason);
      expect(salesInvoice.form.cancellationStatus).toEqual(0);
    });
  });
});
