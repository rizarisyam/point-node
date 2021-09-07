const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form, User } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const deleteFormApproveSalesInvoice = require('../services/deleteFormApprove.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('deleteFormApproveSalesInvoice service', () => {
  // eslint-disable-next-line one-var
  let salesInvoice, form, maker, approver, hacker, customer;
  beforeEach(async () => {
    maker = await User.create({});
    approver = await User.create({});
    hacker = await User.create({});
    customer = await Customer.create({});
    salesInvoice = await SalesInvoice.create({
      customerId: customer.id,
    });
    form = await Form.create({
      salesInvoiceId: salesInvoice.id,
      createdBy: maker.id,
      approvalBy: approver.id,
      approvalStatus: -1, // reject
      cancellationStatus: 0,
    });
  });

  describe('validation', () => {
    const deleteFormApproveSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    it('should throw error forbidden by unwanted user', async () => {
      await expect(deleteFormApproveSalesInvoice(hacker, form.id, deleteFormApproveSalesInvoiceDto)).rejects.toThrow(
        errorForbidden
      );
    });

    it('should throw error if form salesInvoice not in cancellation request status', async () => {
      salesInvoice.form.update({
        cancellationStatus: null,
      });

      await expect(deleteFormApproveSalesInvoice(approver, form.id, deleteFormApproveSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success approve delete', () => {
    const deleteFormApproveSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteFormApproveSalesInvoice(salesInvoice.id, deleteFormApproveSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.cancellationApprovalReason).toEqual(
        deleteFormApproveSalesInvoiceDto.cancellationApprovalReason
      );
      expect(salesInvoice.form.cancellationApprovalBy).toEqual(deleteFormApproveSalesInvoiceDto.cancellationApprovalBy);
      expect(salesInvoice.form.cancellationStatus).toEqual(1);
    });
  });
});
