const moment = require('moment');
const tenantDatabase = require('@src/models').tenant;
const factory = require('@root/tests/utils/factory');
const tokenService = require('@src/modules/auth/services/token.service');
const DeleteFormRejectByToken = require('./DeleteFormRejectByToken');

describe('Stock Correction - Create Form Approve By Token', () => {
  describe('success', () => {
    let stockCorrection, stockCorrectionForm;
    beforeEach(async (done) => {
      const recordFactories = await generateRecordFactories({ stockCorrectionForm: { cancellationStatus: 0 } });
      const { approver } = recordFactories;
      ({ stockCorrection, stockCorrectionForm } = recordFactories);

      const token = await createToken(stockCorrection, approver);

      ({ stockCorrection } = await new DeleteFormRejectByToken(tenantDatabase, token).call());

      done();
    });

    it('change form status to approved', async () => {
      await stockCorrectionForm.reload();
      expect(stockCorrectionForm.cancellationStatus).toEqual(-1);
    });
  });
});

const generateRecordFactories = async ({
  maker,
  approver,
  branch,
  warehouse,
  item,
  stockCorrection,
  stockCorrectionItem,
  stockCorrectionForm,
} = {}) => {
  const chartOfAccountType = await tenantDatabase.ChartOfAccountType.create({
    name: 'cost of sales',
    alias: 'beban pokok penjualan',
    isDebit: true,
  });
  const chartOfAccount = await tenantDatabase.ChartOfAccount.create({
    typeId: chartOfAccountType.id,
    position: 'DEBIT',
    name: 'beban selisih persediaan',
    alias: 'beban selisih persediaan',
  });

  maker = await factory.user.create(maker);
  approver = await factory.user.create(approver);
  branch = await factory.branch.create(branch);
  warehouse = await factory.warehouse.create({ branch, ...warehouse });
  item = await factory.item.create({ chartOfAccount, ...item });
  stockCorrection = await factory.stockCorrection.create({ warehouse, ...stockCorrection });
  stockCorrectionItem = await factory.stockCorrectionItem.create({
    stockCorrection,
    quantity: 10,
    item,
  });
  stockCorrectionForm = await factory.form.create({
    ...stockCorrectionForm,
    branch,
    createdBy: maker.id,
    updatedBy: maker.id,
    requestApprovalTo: approver.id,
    formable: stockCorrection,
    formableType: 'StockCorrection',
    number: 'SC2101001',
  });

  return {
    maker,
    approver,
    branch,
    warehouse,
    item,
    stockCorrection,
    stockCorrectionItem,
    stockCorrectionForm,
  };
};

const createToken = async (stockCorrection, approver) => {
  const payload = {
    stockCorrectionId: stockCorrection.id,
    userId: approver.id,
  };
  const expires = moment().add(7, 'days');

  const token = await tokenService.generatePayloadToken(payload, expires);

  return token;
};
