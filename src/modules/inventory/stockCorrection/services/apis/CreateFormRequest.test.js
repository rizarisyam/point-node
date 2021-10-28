const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const CreateFormRequest = require('./CreateFormRequest');

Date.now = jest.fn(() => new Date(Date.UTC(2021, 0, 1)).valueOf());

describe('Stock Correction - Create Form Request', () => {
  describe('validations', () => {
    it("can't create when requested by user that does not have branch default", async () => {
      const branchUser = { isDefault: false };
      const recordFactories = await generateRecordFactories({ branchUser });
      const { maker, approver, branch, warehouse, allocation, item } = recordFactories;
      const createFormRequestDto = generateCreateFormRequestDto({
        approver,
        branch,
        warehouse,
        allocation,
        item,
      });

      await expect(async () => {
        await new CreateFormRequest(tenantDatabase, { maker, createFormRequestDto }).call();
      }).rejects.toThrow(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    });
  });
  describe('success', () => {
    let stockCorrection, stockCorrectionForm, createFormRequestDto;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      const { maker, approver, branch, warehouse, allocation, item } = recordFactories;
      createFormRequestDto = generateCreateFormRequestDto({
        approver,
        branch,
        warehouse,
        allocation,
        item,
      });

      ({ stockCorrection, stockCorrectionForm } = await new CreateFormRequest(tenantDatabase, {
        maker,
        createFormRequestDto,
      }).call());

      done();
    });

    it('create form with correct date', () => {
      expect(stockCorrectionForm).toBeDefined();
      expect(stockCorrectionForm.number).toEqual('SC2101001');
      expect(stockCorrectionForm.approvalStatus).toEqual(0); // pending
    });

    it('has correct stock correction data', () => {
      expect(stockCorrection.warehouseId).toEqual(createFormRequestDto.warehouseId);
    });
  });
});

const generateRecordFactories = async ({
  maker,
  approver,
  branch,
  branchUser,
  warehouse,
  userWarehouse,
  allocation,
  item,
  inventory,
  inventoryForm,
} = {}) => {
  maker = await factory.user.create(maker);
  approver = await factory.user.create(approver);
  branch = await factory.branch.create(branch);
  branchUser = await factory.branchUser.create({ user: maker, branch, isDefault: true, ...branchUser });
  warehouse = await factory.warehouse.create({ branch, ...warehouse });
  userWarehouse = await factory.userWarehouse.create({ user: maker, warehouse, isDefault: true });
  allocation = await factory.allocation.create({ branch, ...allocation });
  item = await factory.item.create(item);
  inventoryForm = await factory.form.create({
    branch,
    number: 'PI2101001',
    formable: { id: 1 },
    formableType: 'PurchaseInvoice',
    createdBy: maker.id,
    updatedBy: maker.id,
    ...inventoryForm,
  });
  inventory = await factory.inventory.create({ form: inventoryForm, warehouse, item });

  return {
    maker,
    approver,
    branch,
    branchUser,
    warehouse,
    userWarehouse,
    allocation,
    item,
    inventory,
  };
};

const generateCreateFormRequestDto = ({ warehouse, item, allocation, approver }) => ({
  warehouseId: warehouse.id,
  dueDate: new Date('2021-01-01'),
  items: [
    {
      itemId: item.id,
      unit: 'PCS',
      converter: 1,
      stockCorrection: -10,
      notes: 'example stock correction item note',
      allocationId: allocation.id,
    },
  ],
  notes: 'example stock correction note',
  requestApprovalTo: approver.id,
});
