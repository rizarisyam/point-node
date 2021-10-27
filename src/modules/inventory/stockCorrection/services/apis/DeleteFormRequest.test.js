// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const DeleteFormRequest = require('./DeleteFormRequest');

describe('Stock Correction - Delete Form Request', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection, deleteFormRequestDto;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      const { maker } = recordFactories;
      ({ stockCorrection, formStockCorrection } = recordFactories);

      deleteFormRequestDto = {
        reason: 'example reason',
      };

      ({ stockCorrection } = await new DeleteFormRequest(tenantDatabase, {
        maker,
        stockCorrectionId: stockCorrection.id,
        deleteFormRequestDto,
      }).call());

      done();
    });

    it('change form cancellation status to pending', async () => {
      await formStockCorrection.reload();
      expect(formStockCorrection.cancellationStatus).toEqual(0);
      expect(formStockCorrection.requestCancellationReason).toEqual(deleteFormRequestDto.reason);
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
