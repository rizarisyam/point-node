const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form, User } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const createFormApproveSalesInvoice = require('../services/createFormApprove.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('createFormApproveSalesInvoice service', () => {
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
      approvalStatus: 0,
    });
  });

  describe('validation', () => {
    const createFormApproveSalesInvoiceDto = {
      approvalBy: 1,
      approvalReason: 'example reason',
    };

    it('should throw error reject by unwanted user', async () => {
      await expect(createFormApproveSalesInvoice(hacker, form.id, createFormApproveSalesInvoiceDto)).rejects.toThrow(
        errorForbidden
      );
    });

    it('should throw error if salesInvoice is already rejected', async () => {
      form.update({
        approvalStatus: -1,
      });
      await expect(createFormApproveSalesInvoice(createFormApproveSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success approve create', () => {
    const createFormApproveSalesInvoiceDto = {
      approvalBy: 1,
      approvalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await createFormApproveSalesInvoice(salesInvoice.id, createFormApproveSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(form.approvalReason).toEqual(createFormApproveSalesInvoiceDto.approvalReason);
      expect(form.approvalBy).toEqual(createFormApproveSalesInvoiceDto.approvalBy);
      expect(form.approvalStatus).toEqual(1);
    });
  });
});
