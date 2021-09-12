const httpStatus = require('http-status');
const faker = require('faker');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const {
  User,
  Form,
  Branch,
  BranchUser,
  Warehouse,
  WarehouseUser,
  InvoiceItem,
  SalesInvoiceItem,
  DeliveryNote,
  Customer,
  DeliveryOrder,
  DeliveryNoteItem,
  Item,
} = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const createRequestSalesInvoiceService = require('../services/createFormRequest.salesInvoice.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');

setupTestDbTenant();

describe('Create Request Sales Invoice Service', () => {
  describe('test data', () => {
    it('completes all data', async () => {
      const maker = await User.create({
        name: faker.name.findName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        emailConfirmationCode: faker.datatype.string(),
        emailConfirmed: true,
      });

      const approver = await User.create({
        name: faker.name.findName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        emailConfirmationCode: faker.datatype.string(),
        emailConfirmed: true,
      });

      const branch = await Branch.create({
        name: faker.company.companyName(),
      });

      // create relation between maker and branch for authorization
      await BranchUser.create({
        user_id: maker.id,
        branchId: branch.id,
      });

      const customer = await Customer.create({
        name: faker.name.findName(),
        branchId: branch.id,
      });

      const warehouse = await Warehouse.create({
        name: faker.company.companyName(),
        branchId: branch.id,
      });

      const deliveryOrder = await DeliveryOrder.create({
        customerId: customer.id,
        warehouseId: warehouse.id,
        customerName: customer.name,
      });

      const item = await Item.create({
        code: faker.datatype.string(),
        name: faker.commerce.productName(),
        stock: 100,
      });

      const deliveryNote = await DeliveryNote.create({
        customerId: customer.id,
        customerName: customer.name,
        warehouseId: warehouse.id,
        deliveryOrderId: deliveryOrder.id,
        driver: faker.name.findName(),
        licensePlate: 'B1234AA',
      });

      const deliveryNoteItem = await DeliveryNoteItem.create({
        deliveryNoteId: deliveryNote.id,
        itemId: item.id,
        itemName: item.name,
        quantity: 20,
        price: 10000,
        unit: 'pcs',
        converter: 1,
      });

      const formDeliveryNote = await Form.create({
        branchId: branch.id,
        date: new Date('2021-09-01'),
        number: 'DN2109001',
        incrementNumber: 1,
        incrementGroup: 202109,
        formableId: deliveryNote.id,
        formableType: 'DeliveryNote',
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      const validCreateSalesInvoiceDto = {
        formId: formDeliveryNote.id,
        items: [
          {
            itemId: item.id,
            itemReferenceId: deliveryNoteItem.id,
            quantity: 10,
            itemUnitId: 1,
            allocationId: 1,
            price: 100000,
            discountPercent: 0,
            discountValue: 0,
          },
        ],
        createdBy: maker.id,
        requestApprovalTo: approver.id,
        dueDate: new Date('2021-09-15'),
        discountPercent: 0,
        discountValue: 0,
        customerId: customer.id,
        typeOfTax: 'include',
        notes: 'example form note',
      };

      await createRequestSalesInvoiceService(maker, validCreateSalesInvoiceDto);
    });
  });

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
      const user = await User.create({});
      const salesInvoiceItem = await InvoiceItem.create({});
      await expect(createRequestSalesInvoiceService(user, validCreateSalesInvoiceDto)).rejects.toThrow(errorForbidden);
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
