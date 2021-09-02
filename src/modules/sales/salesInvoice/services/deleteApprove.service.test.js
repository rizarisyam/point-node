const setupTestDbTenant = require('../../../../../tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form } = require('../../../../models');
const deleteApproveSalesInvoice = require('./deleteApprove.service');

setupTestDbTenant();

describe('deleteApproveSalesInvoice service', () => {
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
      await expect(deleteApproveSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });

    it('should throw error if salesInvoice is already rejected', async () => {
      salesInvoice.form.update({
        approvalStatus: -1,
      });
      await expect(deleteApproveSalesInvoice(deleteRequestSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success approve delete', () => {
    const deleteRequestSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteApproveSalesInvoice(salesInvoice.id, deleteRequestSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.cancellationApprovalReason).toEqual(deleteRequestSalesInvoiceDto.cancellationApprovalReason);
      expect(salesInvoice.form.cancellationApprovalBy).toEqual(deleteRequestSalesInvoiceDto.cancellationApprovalBy);
      expect(salesInvoice.form.cancellationStatus).toEqual(1);
    });
  });
});
