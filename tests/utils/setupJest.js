const { Project, Package, User, sequelize: mainSequelize } = require('@src/models').main;
const { sequelize: tenantSequelize } = require('@src/models').tenant;

global.beforeAll(async (done) => {
  try {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);

    await mainSequelize.truncate({ cascade: true, force: true });
    await tenantSequelize.truncate({ cascade: true, force: true });

    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  done();
});

global.beforeEach(async () => {
  try {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);

    await mainSequelize.truncate({ cascade: true, force: true });
    await tenantSequelize.truncate({ cascade: true, force: true });

    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);

    await setupTenantProject();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
});

global.afterAll(async (done) => {
  try {
    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 0', null);

    await mainSequelize.truncate({ cascade: true, force: true });
    await tenantSequelize.truncate({ cascade: true, force: true });

    await mainSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
    await tenantSequelize.query('SET FOREIGN_KEY_CHECKS = 1', null);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  done();
});

async function setupTenantProject() {
  const user = await User.create({
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@mail.com',
    password: 'password',
    emailConfirmationCode: 'example',
  });
  const pointPackage = await Package.create({
    code: 'pro',
    name: 'pro',
    description: 'pro',
    maxUser: 1,
    price: 1000,
    pricePerUser: 1000,
    isActive: true,
  });
  await Project.create({
    code: 'tenant_test',
    name: 'tenant_test',
    totalUser: 1,
    ownerId: user.id,
    packageId: pointPackage.id,
    expiredDate: new Date('2050/01/01'),
  });
}
