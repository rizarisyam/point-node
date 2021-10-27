// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const DeleteFormReject = require('./DeleteFormReject');

describe('Stock Correction - Create Form Reject', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection, deleteFormRejectDto;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      ({ stockCorrection } = recordFactories);
      ({ stockCorrection, formStockCorrection } = recordFactories);

      deleteFormRejectDto = {
        reason: 'example reason',
      };

      ({ stockCorrection } = await new DeleteFormReject(tenantDatabase, {
        stockCorrectionId: stockCorrection.id,
        deleteFormRejectDto,
      }).call());

      done();
    });

    it('change form canccelation status to rejected', async () => {
      await formStockCorrection.reload();
      expect(formStockCorrection.cancellationStatus).toEqual(-1); // reject
      expect(formStockCorrection.approvalReason).toEqual(deleteFormRejectDto.reason);
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
