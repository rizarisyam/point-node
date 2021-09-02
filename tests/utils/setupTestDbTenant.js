const { sequelize } = require('../../src/models').tenant;

const setupTestDbTenant = () => {
  beforeAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await sequelize.truncate({ cascade: true, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });

  beforeEach(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await sequelize.truncate({ cascade: true, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });

  afterAll(async () => {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await sequelize.truncate({ cascade: true, force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  });
};

module.exports = setupTestDbTenant;
