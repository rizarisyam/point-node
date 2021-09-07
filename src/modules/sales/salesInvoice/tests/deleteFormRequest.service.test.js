const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { Customer, Form, SalesInvoice, User } = require('@src/models');
const ApiError = require('@src/utils/ApiError');
const deleteFormRequestSalesInvoice = require('../services/deleteFormRequest.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('deleteFormRequestSalesInvoice service', () => {
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
    const deleteFormRequestSalesInvoiceDto = {
      requestCancellationBy: 2,
      requestCancellationTo: 1,
      requestCancellationReason: 'example reason',
    };

    it('should throw error forbidden by unwanted user', async () => {
      await expect(deleteFormRequestSalesInvoice(hacker, form.id, deleteFormRequestSalesInvoiceDto)).rejects.toThrow(
        errorForbidden
      );
    });

    it('cannot be delete if already have reference id', () => {
      // TODO
    });
  });

  describe('success request delete', () => {
    const deleteFormRequestSalesInvoiceDto = {
      requestCancellationBy: 2,
      requestCancellationTo: 1,
      requestCancellationReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await deleteFormRequestSalesInvoice(hacker, form.id, deleteFormRequestSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.requestCancellationBy).toEqual(deleteFormRequestSalesInvoiceDto.requestCancellationBy);
      expect(salesInvoice.form.requestCancellationTo).toEqual(deleteFormRequestSalesInvoiceDto.requestCancellationTo);
      expect(salesInvoice.form.requestCancellationReason).toEqual(
        deleteFormRequestSalesInvoiceDto.requestCancellationReason
      );
      expect(salesInvoice.form.cancellationStatus).toEqual(0);
    });
  });
});
