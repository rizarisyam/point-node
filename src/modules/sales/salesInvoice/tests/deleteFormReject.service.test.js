const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form, User } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const deleteFormRejectSalesInvoice = require('../services/deleteFormReject.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('deleteFormRejectSalesInvoice service', () => {
  // eslint-disable-next-line one-var
  let salesInvoice, form, maker, approver, hacker, customer, superAdmin;
  beforeEach(async () => {
    maker = await User.create({});
    approver = await User.create({});
    hacker = await User.create({});
    superAdmin = await User.create({});
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
    const deleteFormRejectSalesInvoiceDto = {
      cancellationApprovalReason: 'example reason',
    };

    it('should throw error forbidden by unwanted user', async () => {
      await expect(deleteFormRejectSalesInvoice(hacker, form.id, deleteFormRejectSalesInvoiceDto)).rejects.toThrow(
        errorForbidden
      );
    });

    it('not throw error if reject by super admin', async () => {
      salesInvoice = await deleteFormRejectSalesInvoice(superAdmin, form.id, deleteFormRejectSalesInvoiceDto);

      expect(form.approvalReason).toEqual(deleteFormRejectSalesInvoiceDto.approvalReason);
      expect(form.approvalBy).toEqual(superAdmin.id);
      expect(form.approvalStatus).toEqual(-1);
    });

    it('should throw error if form salesInvoice not in cancellation request status', async () => {
      salesInvoice.form.update({
        cancellationStatus: null,
      });

      await expect(deleteFormRejectSalesInvoice(approver, form.id, deleteFormRejectSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success reject delete', () => {
    const deleteFormRejectSalesInvoiceDto = {
      cancellationApprovalBy: 1,
      cancellationApprovalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteFormRejectSalesInvoice(approver, form.id, salesInvoice.id, deleteFormRejectSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.cancellationApprovalReason).toEqual(
        deleteFormRejectSalesInvoiceDto.cancellationApprovalReason
      );
      expect(salesInvoice.form.cancellationApprovalBy).toEqual(deleteFormRejectSalesInvoiceDto.cancellationApprovalBy);
      expect(salesInvoice.form.cancellationStatus).toEqual(-1);
    });
  });
});
