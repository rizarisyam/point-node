const setupTestDb = require('../../../../utils/setupTestDB');
const { SalesInvoice, Customer, Form } = require('../../../../../src/models');
const createRejectSalesInvoice = require('../../../../../src/services/v1/salesInvoice/createApprove.service');

setupTestDb();

describe('createRejectSalesInvoice service', () => {
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

    it('should throw error if salesInvoice is already approved', async () => {
      salesInvoice.form.update({
        approvalStatus: 1,
      });
      await expect(createRejectSalesInvoice(createApproveSalesInvoiceDto)).rejects.toThrow();
    });
  });

  describe('success reject create', () => {
    const createApproveSalesInvoiceDto = {
      approvalBy: 1,
      approvalReason: 'example reason',
    };

    beforeEach(async () => {
      salesInvoice = await createRejectSalesInvoice(salesInvoice.id, createApproveSalesInvoiceDto);
    });

    it('has correct form data', () => {
      expect(salesInvoice.form.approvalReason).toEqual(createApproveSalesInvoiceDto.approvalReason);
      expect(salesInvoice.form.approvalBy).toEqual(createApproveSalesInvoiceDto.approvalBy);
      expect(salesInvoice.form.approvalStatus).toEqual(-1);
    });
  });
});
