const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form, User } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const createFormApproveSalesInvoice = require('../services/createFormApprove.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('createFormApproveSalesInvoice service', () => {
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
      approvalStatus: 0,
    });
  });

  describe('validation', () => {
    const createFormApproveSalesInvoiceDto = {
      approvalReason: 'example reason',
    };

    it('should throw error forbidden by unwanted user', async () => {
      await expect(createFormApproveSalesInvoice(hacker, form.id, createFormApproveSalesInvoiceDto)).rejects.toThrow(
        errorForbidden
      );
    });

    it('not throw error if approve by super admin', async () => {
      salesInvoice = await createFormApproveSalesInvoice(superAdmin, form.id, createFormApproveSalesInvoiceDto);

      expect(form.approvalReason).toEqual(createFormApproveSalesInvoiceDto.approvalReason);
      expect(form.approvalBy).toEqual(superAdmin.id);
      expect(form.approvalStatus).toEqual(1); // approved
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
      expect(form.approvalStatus).toEqual(1); // approved
    });

    it('create journal of this sales invoice on ledger and sub ledger', () => {
      /**
       * Journal Table
       * -------------------------------------------
       * Account                  | Debit | Credit |
       * -------------------------------------------
       * 1. Account Receivable    |   v   |        | Master Supplier
       * 2. Sales Income          |       |   v    |
       * 3. Inventories           |       |   v    | Master Item
       * 4. Cogs                  |   v   |        |
       * 5. Income Tax Payable    |       |   v    |.
       */

      expect(form.journals.count).not.toEqual(0);
    });
  });
});
