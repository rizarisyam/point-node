const setupTestDb = require('../../../../utils/setupTestDB');
const { SalesInvoice, Customer, Form } = require('../../../../../src/models');
const deleteRejectSalesInvoice = require('../../../../../src/services/v1/salesInvoice/deleteReject.service');

setupTestDb();

describe('deleteRejectSalesInvoice service', () => {
  let salesInvoice;
  let customer;
  beforeEach(async () => {
    customer = await Customer.create({});
    salesInvoice = await SalesInvoice.create({ customerId: customer.id });
    await Form.create({ salesInvoiceId: salesInvoice.id, cancellationStatus: 0 });
  });

  describe('validation', () => {
    const deleteRequestSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    it('should throw error if salesInvoice is already approved', async () => {
      salesInvoice.form.update({
        approvalStatus: 1,
      });
      await expect(deleteRejectSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });

    it('should throw error if salesInvoice is already rejected', async () => {
      salesInvoice.form.update({
        approvalStatus: -1,
      });
      await expect(deleteRejectSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });

    it('should throw error if form salesInvoice not in cancellation request status', async () => {
      salesInvoice.form.update({
        cancellationStatus: null,
      });

      await expect(deleteRejectSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success reject delete', () => {
    const deleteRequestSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteRejectSalesInvoice(salesInvoice.id, deleteRequestSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.cancellationApprovalReason).toEqual(deleteRequestSalesInvoiceDto.cancellationApprovalReason);
      expect(salesInvoice.form.cancellationApprovalBy).toEqual(deleteRequestSalesInvoiceDto.cancellationApprovalBy);
      expect(salesInvoice.form.cancellationStatus).toEqual(-1);
    });
  });
});
