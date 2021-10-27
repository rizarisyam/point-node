// const httpStatus = require('http-status');
// const ApiError = require('@src/utils/ApiError');
const moment = require('moment');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const tokenService = require('@src/modules/auth/services/token.service');
const CreateFormApproveByToken = require('./CreateFormApproveByToken');

describe('Stock Correction - Create Form Approve By Token', () => {
  describe('success', () => {
    let stockCorrection, formStockCorrection;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories();
      const { approver } = recordFactories;
      ({ stockCorrection, formStockCorrection } = recordFactories);

      const token = await createToken(stockCorrection, approver);

      ({ stockCorrection } = await new CreateFormApproveByToken(tenantDatabase, token).call());

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

const createToken = async (stockCorrection, approver) => {
  const payload = {
    stockCorrection: stockCorrection.id,
    userId: approver.id,
  };
  const expires = moment().add(7, 'days');

  const token = await tokenService.generatePayloadToken(payload, expires);

  return token;
};
