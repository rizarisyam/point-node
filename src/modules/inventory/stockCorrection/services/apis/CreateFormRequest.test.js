// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const CreateFormRequest = require('./CreateFormRequest');

describe('Stock Correction - Create Form Request', () => {
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
      expect(stockCorrectionForm.approvalStatus).toEqual(0);
    });

    it('has correct stock correction data', () => {
      expect(stockCorrection.warehouse).toEqual(createFormRequestDto.warehouseId);
    });
  });
});

const generateRecordFactories = async ({ maker, approver, branch, warehouse, allocation, item }) => {
  maker = await factory.user.create(maker);
  approver = await factory.user.create(approver);
  branch = await factory.branch.create(branch);
  warehouse = await factory.warehouse.create(warehouse);
  allocation = await factory.allocation.create({ branch, ...allocation });
  item = await factory.item.create(item);

  return {
    maker,
    approver,
    branch,
    warehouse,
    allocation,
    item,
  };
};

const generateCreateFormRequestDto = ({ warehouse, item, allocation, approver }) => ({
  warehouseId: warehouse.id,
  dueDate: new Date('2021-01-01'),
  items: [
    {
      itemId: item.id,
      stockCorrection: 10,
      notes: 'example stock correction item note',
      allocationId: allocation.id,
    },
  ],
  notes: 'example stock correction note',
  requestApprovalTo: approver.id,
});
