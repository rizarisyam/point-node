const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const { User, Form, Branch, BranchUser, Warehouse, WarehouseUser } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const createRequestSalesInvoiceService = require('../services/createFormRequest.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

const validCreateSalesInvoiceDto = {
  formId: 1,
  items: [
    {
      itemId: 1,
      quantity: 10,
      itemUnitId: 1,
      allocationId: 1,
      discount: {
        percent: 0.05,
        value: 0,
      },
    },
    {
      itemId: 2,
      quantity: 20,
      itemUnitId: 2,
      allocationId: 2,
      discount: {
        percent: 0.1,
        value: 0,
      },
    },
  ],
  createdBy: 1,
  dueDate: '2021-09-04T23:29:26.800Z',
  discount: {
    percent: 0.05,
    value: 0,
  },
  customerId: 1,
  typeOfTax: 'include',
  notes: 'example form note',
};

describe('Create Request Sales Invoice Service', () => {
  describe('validations', () => {
    it('can not create when requested by user that does not have branch default', async () => {
      const branch = await Branch.create({});
      const user = await User.create({});
      await BranchUser.create({ branch_id: branch.id, user_id: user.id, is_default: false });
      const formReference = await Form.create({ branch_id: branch.id });
      validCreateSalesInvoiceDto.form_id = formReference.id;

      await expect(createRequestSalesInvoiceService(user, validCreateSalesInvoiceDto)).rejects.toThrow(errorForbidden);
    });

    it('can not create when requested by user that does not have warehouse default', async () => {
      // TODO
    });
  });

  describe('when success', () => {
    let salesInvoice;
    let user;
    beforeEach(async () => {
      user = await User.create({
        email: 'john.doe@mail.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        address: 'Jakarta',
        phone: '085209090909',
      });
      salesInvoice = await createRequestSalesInvoiceService(user, validCreateSalesInvoiceDto);
    });

    it('creates form with correct form data', () => {
      // SI + tahun created form (21) + bulan created form (07) + nomor urut form (001)
      expect(salesInvoice.form).toBeDefined();
      expect(salesInvoice.form.number).toEqual('SI2107001');
      expect(salesInvoice.form.approvalStatus).toEqual(0); // pending
    });

    it('has correct user data who created form', () => {
      expect(salesInvoice.form.createdBy.id).toEqual(user.id);
      expect(salesInvoice.form.createdBy.name).toEqual(user.name);
      expect(salesInvoice.form.createdBy.address).toEqual(user.address);
    });

    it('has correct user approver data', () => {
      expect(salesInvoice.form.approvalBy.id).toEqual(user.id);
      expect(salesInvoice.form.approvalBy.name).toEqual(user.name);
      expect(salesInvoice.form.approvalBy.address).toEqual(user.address);
    });

    it('has correct sales invoice items data', async () => {
      const salesInvoiceItems = await salesInvoice.salesInvoiceItems;
      expect(salesInvoiceItems.length).toEqual(0);

      const firstItemSalesInvoiceCreateSalesInvoiceDto = validCreateSalesInvoiceDto.items[0];
      const firstSalesInvoiceItem = salesInvoiceItems.find(
        (salesInvoiceItem) => salesInvoiceItem.id === firstItemSalesInvoiceCreateSalesInvoiceDto
      );
      expect(firstSalesInvoiceItem.quantity).toEqual(firstItemSalesInvoiceCreateSalesInvoiceDto.quantity);
      expect(firstSalesInvoiceItem.price).toEqual(firstItemSalesInvoiceCreateSalesInvoiceDto.price);
      expect(firstSalesInvoiceItem.discount).toEqual(firstItemSalesInvoiceCreateSalesInvoiceDto.discount);
    });

    it('has correct sales invoice data', () => {
      expect(salesInvoice.typeOfTax).toEqual('non');
      // include tax
      // (taxBase * 100%) / 110
      // exclude tax
      // taxBase * 10%
      expect(salesInvoice.tax).toEqual(0);
      // amount = taxBase + tax
      expect(salesInvoice.amount).toEqual(0);
      expect(salesInvoice.dueDate).toEqual(validCreateSalesInvoiceDto.salesInvoice.dueDate);
    });
  });
});
