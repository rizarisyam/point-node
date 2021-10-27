// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const CreateFormReject = require('./CreateFormReject');

describe('Stock Correction - Create Form Request', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection, createFormRejectDto;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      const { approver } = recordFactories;
      ({ stockCorrection, formStockCorrection } = recordFactories);

      createFormRejectDto = {
        reason: 'example reason',
      };

      ({ stockCorrection } = await new CreateFormReject(tenantDatabase, {
        approver,
        stockCorrectionId: stockCorrection.id,
        createFormRejectDto,
      }).call());

      done();
    });

    it('update form status to rejected', async () => {
      await formStockCorrection.reload();
      expect(formStockCorrection.approvalStatus).toEqual(-1); // rejected
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
