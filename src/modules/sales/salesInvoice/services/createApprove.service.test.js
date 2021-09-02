const setupTestDbTenant = require('../../../../../tests/utils/setupTestDbTenant');
const { SalesInvoice, Customer, Form } = require('../../../../models');
const createApproveSalesInvoice = require('./createApprove.service');

setupTestDbTenant();

describe('createApproveSalesInvoice service', () => {
  let salesInvoice;
  let customer;
  beforeEach(async () => {
    customer = await Customer.create({});
    salesInvoice = await SalesInvoice.create({ customerId: customer.id });
    await Form.create({ salesInvoiceId: salesInvoice.id, approvalStatus: 0 });
  });

  describe('validation', () => {
    const createApproveSalesInvoiceDto = {
      approvalBy: 1,
      approvalReason: 'example reason',
    };

    it('should throw error if salesInvoice is already rejected', async () => {
      salesInvoice.form.update({
        approvalStatus: -1,
      });
      await expect(createApproveSalesInvoice(createApproveSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success approve create', () => {
    const createApproveSalesInvoiceDto = {
      approvalBy: 1,
      approvalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await createApproveSalesInvoice(salesInvoice.id, createApproveSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.approvalReason).toEqual(createApproveSalesInvoiceDto.approvalReason);
      expect(salesInvoice.form.approvalBy).toEqual(createApproveSalesInvoiceDto.approvalBy);
      expect(salesInvoice.form.approvalStatus).toEqual(1);
    });
  });
});
