const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const CreateFormApprove = require('./CreateFormApprove');

describe('Sales Invoice - CreateFormApprove', () => {
  describe('validations', () => {
    it('throw error when sales invoice is not exist', async () => {
      const approver = await factory.user.create();

      await expect(async () => {
        await new CreateFormApprove(tenantDatabase, { approver, salesInvoiceId: 'invalid-id' }).call();
      }).rejects.toThrow(new ApiError(httpStatus.NOT_FOUND, 'Sales invoice is not exist'));
    });

    it('throw error when approved by unwanted user', async () => {
      const hacker = await factory.user.create();
      const { salesInvoice } = await generateRecordFactories();

      await expect(async () => {
        await new CreateFormApprove(tenantDatabase, { approver: hacker, salesInvoiceId: salesInvoice.id }).call();
      }).rejects.toThrow(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    });

    it('throw error when sales invoice is already rejected', async () => {
      const { approver, salesInvoice, formSalesInvoice } = await generateRecordFactories();
      await formSalesInvoice.update({
        approvalStatus: -1,
      });

      await expect(async () => {
        await new CreateFormApprove(tenantDatabase, { approver, salesInvoiceId: salesInvoice.id }).call();
      }).rejects.toThrow(new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Sales invoice already rejected'));
    });

    it('return approved sales invoice when sales invoice is already approved', async () => {
      const { approver, salesInvoice, formSalesInvoice } = await generateRecordFactories();
      await formSalesInvoice.update({
        approvalStatus: 1,
      });

      const createFormApprove = await new CreateFormApprove(tenantDatabase, {
        approver,
        salesInvoiceId: salesInvoice.id,
      }).call();

      expect(createFormApprove.salesInvoice).toBeDefined();
      expect(createFormApprove.salesInvoice.form.approvalStatus).toEqual(1);
    });
  });

  describe('success approve', () => {
    let salesInvoice, approver, formSalesInvoice;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      ({ salesInvoice, approver, formSalesInvoice } = recordFactories);

      ({ salesInvoice } = await new CreateFormApprove(tenantDatabase, {
        approver,
        salesInvoiceId: salesInvoice.id,
      }).call());

      done();
    });

    it('update form status to approved', async () => {
      await formSalesInvoice.reload();
      expect(formSalesInvoice.approvalStatus).toEqual(1);
    });

    it('create the journals', async () => {
      const journals = await tenantDatabase.Journal.findAll({ where: { formId: formSalesInvoice.id } });
      expect(journals.length).toEqual(5);
    });
  });
});

const generateRecordFactories = async ({
  maker,
  approver,
  branch,
  branchUser,
  customer,
  warehouse,
  userWarehouse,
  deliveryOrder,
  item,
  itemUnit,
  deliveryNote,
  allocation,
  deliveryNoteItem,
  formDeliveryNote,
  salesInvoice,
  salesInvoiceItem,
  formSalesInvoice,
} = {}) => {
  const chartOfAccountType = await tenantDatabase.ChartOfAccountType.create({
    name: 'cash',
    alias: 'kas',
    isDebit: true,
  });
  const chartOfAccount = await tenantDatabase.ChartOfAccount.create({
    typeId: chartOfAccountType.id,
    position: '',
    name: 'kas besar',
    alias: 'kas besar',
  });

  maker = maker || (await factory.user.create());
  approver = approver || (await factory.user.create());
  branch = branch || (await factory.branch.create());
  // create relation between maker and branch for authorization
  branchUser = branchUser || (await factory.branchUser.create({ user: maker, branch, isDefault: true }));
  customer = customer || (await factory.customer.create({ branch }));
  warehouse = warehouse || (await factory.warehouse.create({ branch }));
  // create relation between maker and warehouse for authorization
  userWarehouse = userWarehouse || (await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true }));
  deliveryOrder = deliveryOrder || (await factory.deliveryOrder.create({ customer, warehouse }));
  item = item || (await factory.item.create({ chartOfAccount }));
  itemUnit = itemUnit || (await factory.itemUnit.create({ item, createdBy: maker.id }));
  deliveryNote = deliveryNote || (await factory.deliveryNote.create({ customer, warehouse, deliveryOrder }));
  allocation = allocation || (await factory.allocation.create({ branch }));
  deliveryNoteItem = deliveryNoteItem || (await factory.deliveryNoteItem.create({ deliveryNote, item, allocation }));
  formDeliveryNote =
    formDeliveryNote ||
    (await factory.form.create({
      branch,
      formable: deliveryNote,
      formableType: 'SalesDeliveryNote',
      createdBy: maker.id,
      updatedBy: maker.id,
      requestApprovalTo: approver.id,
    }));
  salesInvoice =
    salesInvoice ||
    (await factory.salesInvoice.create({
      customer,
      referenceable: deliveryNote,
      referenceableType: 'SalesDeliveryNote',
    }));
  salesInvoiceItem =
    salesInvoiceItem ||
    (await factory.salesInvoiceItem.create({ salesInvoice, deliveryNote, deliveryNoteItem, item, allocation }));
  formSalesInvoice =
    formSalesInvoice ||
    (await factory.form.create({
      branch,
      reference: salesInvoice,
      createdBy: maker.id,
      updatedBy: maker.id,
      requestApprovalTo: approver.id,
      formable: salesInvoice,
      formableType: 'SalesInvoice',
      number: 'SI2109001',
    }));

  await tenantDatabase.SettingJournal.create({
    feature: 'sales',
    name: 'account receivable',
    description: 'account receivable',
    chartOfAccountId: chartOfAccount.id,
  });
  await tenantDatabase.SettingJournal.create({
    feature: 'sales',
    name: 'sales income',
    description: 'sales income',
    chartOfAccountId: chartOfAccount.id,
  });
  await tenantDatabase.SettingJournal.create({
    feature: 'sales',
    name: 'income tax payable',
    description: 'income tax payable',
    chartOfAccountId: chartOfAccount.id,
  });

  return {
    maker,
    approver,
    branch,
    branchUser,
    customer,
    warehouse,
    userWarehouse,
    deliveryOrder,
    item,
    itemUnit,
    deliveryNote,
    allocation,
    deliveryNoteItem,
    formDeliveryNote,
    salesInvoice,
    salesInvoiceItem,
    formSalesInvoice,
  };
};
