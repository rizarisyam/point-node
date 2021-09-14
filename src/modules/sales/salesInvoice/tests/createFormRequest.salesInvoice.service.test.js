const httpStatus = require('http-status');
const setupTestDbTenant = require('@root/tests/utils/setupTestDbTenant');
const ApiError = require('@src/utils/ApiError');
const factory = require('@root/tests/utils/factory');
const createRequestSalesInvoiceService = require('../services/createFormRequest.salesInvoice.service');

setupTestDbTenant();
Date.now = jest.fn(() => new Date(Date.UTC(2021, 0, 1)).valueOf());

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
const generateCreateSalesInvoiceDto = ({
  formDeliveryNote,
  item,
  deliveryNoteItem,
  itemUnit,
  maker,
  approver,
  customer,
}) => ({
  formId: formDeliveryNote.id,
  items: [
    {
      itemId: item.id,
      referenceItemId: deliveryNoteItem.id,
      quantity: 10,
      itemUnitId: itemUnit.id,
      allocationId: 1,
      price: 10000,
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
  typeOfTax: 'non',
  notes: 'example form note',
});

describe('Create Request Sales Invoice Service', () => {
  describe('validations', () => {
    it('can not create when requested by user that does not have branch default', async () => {
      const maker = await factory.user.create();
      const approver = await factory.user.create();
      const branch = await factory.branch.create();
      // create relation between maker and branch for authorization
      await factory.branchUser.create({ user: maker, branch, isDefault: false });
      const customer = await factory.customer.create({ branch });
      const warehouse = await factory.warehouse.create({ branch });
      // // create relation between maker and warehouse for authorization
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      const deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      const item = await factory.item.create();
      const itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      const deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      const deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      const formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      const createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      await expect(async () => {
        await createRequestSalesInvoiceService(maker, createSalesInvoiceDto);
      }).rejects.toThrow(errorForbidden);
    });

    it('can not create when requested by user that does not have warehouse default', async () => {
      const maker = await factory.user.create();
      const approver = await factory.user.create();
      const branch = await factory.branch.create();
      // create relation between maker and branch for authorization
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      const customer = await factory.customer.create({ branch });
      const warehouse = await factory.warehouse.create({ branch });
      // // create relation between maker and warehouse for authorization
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: false });
      const deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      const item = await factory.item.create();
      const itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      const deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      const deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      const formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      const createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      await expect(async () => {
        await createRequestSalesInvoiceService(maker, createSalesInvoiceDto);
      }).rejects.toThrow(errorForbidden);
    });
  });

  describe('when typeOfTax is non', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoiceForm, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoiceForm = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });
    });

    it('creates form with correct form data', async () => {
      ({ salesInvoiceForm, salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoiceForm).toBeDefined();
      // SI + tahun created form (21) + bulan created form (0) + nomor urut form (001)
      expect(salesInvoiceForm.number).toEqual('SI2101001');
      expect(salesInvoiceForm.approvalStatus).toEqual(0); // pending
    });

    it('has correct user data who created form', async () => {
      ({ salesInvoiceForm, salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      const createdByUser = await salesInvoiceForm.getCreatedByUser();
      expect(createdByUser.id).toEqual(maker.id);
    });

    it('has correct user approver data', async () => {
      ({ salesInvoiceForm, salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      const requestApprovalToUser = await salesInvoiceForm.getRequestApprovalToUser();
      expect(requestApprovalToUser.id).toEqual(approver.id);
    });

    it('has correct sales invoice items data', async () => {
      ({ salesInvoiceForm, salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      const salesInvoiceItems = await salesInvoice.getItems();
      expect(salesInvoiceItems.length).toEqual(1);

      const firstItemSalesInvoiceCreateSalesInvoiceDto = createSalesInvoiceDto.items[0];
      const firstSalesInvoiceItem = salesInvoiceItems[0];

      expect(parseFloat(firstSalesInvoiceItem.quantity)).toEqual(firstItemSalesInvoiceCreateSalesInvoiceDto.quantity);
      expect(parseFloat(firstSalesInvoiceItem.price)).toEqual(firstItemSalesInvoiceCreateSalesInvoiceDto.price);
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoiceForm, salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('non');
      expect(salesInvoice.tax).toEqual(0); // 0 tax
      expect(salesInvoice.amount).toEqual(100000); // 10.000 * 10
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when typeOfTax is include', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'include';
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('include');
      const subTotal = 100000; // 10.000 * 10
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = (taxBase * 10) / 11; // include
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when typeOfTax is exclude', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'exclude';
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('exclude');
      const subTotal = 100000; // 10.000 * 10
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = taxBase * 0.1; // exclude
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when item has discount value', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'exclude';
      createSalesInvoiceDto.items[0].discountValue = 2000;
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('exclude');
      const subTotal = 80000; // (10.000 * 10) - (2.000 * 10)
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = taxBase * 0.1; // exclude
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when item has discount percent', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'exclude';
      createSalesInvoiceDto.items[0].discountPercent = 10;
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('exclude');
      const subTotal = 90000; // 9.000 * 10
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = taxBase * 0.1; // exclude
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when sales invoice has discount value', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'exclude';
      createSalesInvoiceDto.discountValue = 10000;
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('exclude');
      const subTotal = 90000; // 10.000 * 10 - 10.000
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = taxBase * 0.1; // exclude
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });

  describe('when sales invoice has discount percent', () => {
    // eslint-disable-next-line prettier/prettier, one-var
    let maker, approver, branch, customer, warehouse, deliveryOrder,item, itemUnit, deliveryNote, deliveryNoteItem, formDeliveryNote, createSalesInvoiceDto, salesInvoice;
    beforeEach(async () => {
      // eslint-disable-next-line prettier/prettier, no-multi-assign
      maker = approver = branch = customer = warehouse = deliveryOrder = item = itemUnit = deliveryNote = deliveryNoteItem = formDeliveryNote = createSalesInvoiceDto = salesInvoice = null;

      maker = await factory.user.create();
      approver = await factory.user.create();
      branch = await factory.branch.create();
      await factory.branchUser.create({ user: maker, branch, isDefault: true });
      customer = await factory.customer.create({ branch });
      warehouse = await factory.warehouse.create({ branch });
      await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
      deliveryOrder = await factory.deliveryOrder.create({ customer, warehouse });
      item = await factory.item.create();
      itemUnit = await factory.itemUnit.create({ item, createdBy: maker.id });
      deliveryNote = await factory.deliveryNote.create({ customer, warehouse, deliveryOrder });
      deliveryNoteItem = await factory.deliveryNoteItem.create({ deliveryNote, item });
      formDeliveryNote = await factory.form.create({
        branch,
        reference: deliveryNote,
        createdBy: maker.id,
        updatedBy: maker.id,
        requestApprovalTo: approver.id,
      });

      createSalesInvoiceDto = generateCreateSalesInvoiceDto({
        formDeliveryNote,
        item,
        deliveryNoteItem,
        itemUnit,
        maker,
        approver,
        customer,
      });

      createSalesInvoiceDto.typeOfTax = 'exclude';
      createSalesInvoiceDto.discountPercent = 10;
    });

    it('has correct sales invoice data', async () => {
      ({ salesInvoice } = await createRequestSalesInvoiceService(maker, createSalesInvoiceDto));

      expect(salesInvoice.typeOfTax).toEqual('exclude');
      const subTotal = 90000; // (10.000 * 10) - (10.000 * 10 * 10%)
      const taxBase = subTotal - 0; // without sales invoice discount
      const tax = taxBase * 0.1; // exclude
      const amount = taxBase + tax;
      expect(salesInvoice.tax).toEqual(tax);
      expect(salesInvoice.amount).toEqual(amount);
      expect(salesInvoice.dueDate).toEqual(createSalesInvoiceDto.dueDate);
    });
  });
});
