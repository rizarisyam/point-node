/* eslint-disable */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/database.js`)[env];
const db = {
  main: {},
  tenant: {}
};

const configDbMain = config.databases.main;
const mainSequelize = new Sequelize(
 configDbMain.database,
 configDbMain.username,
 configDbMain.password,
 configDbMain
);
const configDbTenant = config.databases.tenant;
const tenantSequelize = new Sequelize(
  configDbTenant.database,
  configDbTenant.username,
  configDbTenant.password,
  configDbTenant
);

//Add models from main folder
fs
  .readdirSync(__dirname + '/main')
  .filter(file =>
      (file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js'))
  .forEach(file => {
      const model = require(path.join(__dirname + '/main', file))(mainSequelize, Sequelize.DataTypes);
      db.main[model.name] = model;
  });

// Add models from tenant folder
fs
  .readdirSync(__dirname + '/tenant')
  .filter(file =>
      (file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js'))
  .forEach(file => {
      const model = require(path.join(__dirname + '/tenant', file))(tenantSequelize, Sequelize.DataTypes);
      db.tenant[model.name] = model;
  });

Object.keys(db.main).forEach((modelName) => {
  if (db.main[modelName].associate) {
    db.main[modelName].associate(db);
  }
});

Object.keys(db.tenant).forEach((modelName) => {
  if (db.tenant[modelName].associate) {
    db.tenant[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.main.sequelize = mainSequelize
db.tenant.sequelize = tenantSequelize

module.exports = db;
/* eslint-enable */
