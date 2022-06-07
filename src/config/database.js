const config = require('./config');

const DIALECT = 'mysql';

module.exports = {
  development: {
    databases: {
      main: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.name,
        host: config.database.host,
        port: config.database.port,
        dialect: DIALECT,
        logging: config.database.logging,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
      // tenant: {
      //   username: config.tenantDatabase.username,
      //   password: config.tenantDatabase.password,
      //   database: config.tenantDatabase.name,
      //   host: config.tenantDatabase.host,
      //   port: config.tenantDatabase.port,
      //   dialect: DIALECT,
      //   logging: config.tenantDatabase.logging,
      //   dialectOptions: {
      //     bigNumberStrings: true,
      //   },
      // },
    },
  },
  staging: {
    databases: {
      main: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.name,
        host: config.database.host,
        port: config.database.port,
        logging: config.database.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
      tenant: {
        username: config.tenantDatabase.username,
        password: config.tenantDatabase.password,
        database: config.tenantDatabase.name,
        host: config.tenantDatabase.host,
        port: config.tenantDatabase.port,
        logging: config.tenantDatabase.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
    },
  },
  test: {
    databases: {
      main: {
        username: config.testDatabase.username,
        password: config.testDatabase.password,
        database: config.testDatabase.name,
        host: config.testDatabase.host,
        port: config.testDatabase.port,
        logging: config.testDatabase.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
      tenant: {
        username: config.testTenantDatabase.username,
        password: config.testTenantDatabase.password,
        database: config.testTenantDatabase.name,
        host: config.testTenantDatabase.host,
        port: config.testTenantDatabase.port,
        logging: config.testTenantDatabase.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
    },
  },
  production: {
    databases: {
      main: {
        username: config.database.username,
        password: config.database.password,
        database: config.database.name,
        host: config.database.host,
        port: config.database.port,
        logging: config.database.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
      tenant: {
        username: config.tenantDatabase.username,
        password: config.tenantDatabase.password,
        database: config.tenantDatabase.name,
        host: config.tenantDatabase.host,
        port: config.tenantDatabase.port,
        logging: config.tenantDatabase.logging,
        dialect: DIALECT,
        dialectOptions: {
          bigNumberStrings: true,
        },
      },
    },
  },
};
