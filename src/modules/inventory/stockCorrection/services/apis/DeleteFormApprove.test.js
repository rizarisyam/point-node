// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const DeleteFormApprove = require('./DeleteFormApprove');

describe('Stock Correction - Create Form Reject', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      ({ stockCorrection } = recordFactories);
      ({ stockCorrection, formStockCorrection } = recordFactories);

      ({ stockCorrection } = await new DeleteFormApprove(tenantDatabase, {
        stockCorrectionId: stockCorrection.id,
      }).call());

      done();
    });

    it('change form cancellation status to approved', async () => {
      await formStockCorrection.reload();
      expect(formStockCorrection.cancellationStatus).toEqual(1); // approved
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
