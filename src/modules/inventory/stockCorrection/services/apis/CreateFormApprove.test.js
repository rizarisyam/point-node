// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const CreateFormApprove = require('./CreateFormApprove');

describe('Stock Correction - Create Form Approve', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      const { approver } = recordFactories;
      ({ stockCorrection, formStockCorrection } = recordFactories);

      ({ stockCorrection } = await new CreateFormApprove(tenantDatabase, {
        approver,
        stockCorrectionId: stockCorrection.id,
      }).call());

      done();
    });

    it('change form status to approved', async () => {
      await formStockCorrection.reload();
      expect(formStockCorrection.approvalStatus).toEqual(1);
    });

    it('create the journals', async () => {
      const journals = await tenantDatabase.Journal.findAll({ where: { formId: formStockCorrection.id } });
      expect(journals.length).toEqual(2);
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
