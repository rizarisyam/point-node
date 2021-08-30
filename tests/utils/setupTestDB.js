const { sequelize: mainSequelize } = require('../../src/models').main;

const setupTestDB = () => {
  beforeAll(async () => {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await mainSequelize.truncate({ cascade: true, force: true });
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });

  beforeEach(async () => {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await mainSequelize.truncate({ cascade: true, force: true });
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });

  afterAll(async () => {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await mainSequelize.truncate({ cascade: true, force: true });
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });
};

module.exports = setupTestDB;
