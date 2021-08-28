/* eslint-disable */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(`${__dirname}/../config/database.js`)[env];
const db = {};

db.main = new Sequelize(config.databases.main.database, config.databases.main.username, config.databases.main.password, config.databases.main);
db.tenant = new Sequelize(config.databases.tenant.database, config.databases.tenant.username, config.databases.tenant.password, config.databases.tenant);

console.log(db.main.import);
db.model = {
  main: {},
  tenant: {}
}
//Add models from main folder
fs
  .readdirSync(__dirname + '/main')
  .filter(file =>
      (file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js'))
  .forEach(file => {
      // const model = db.main.import(path.join(__dirname + '/main', file));
      const model = require(path.join(__dirname + '/main', file))(db.main, Sequelize.DataTypes);
      db.model.main[model.name] = model;
  });

// Add models from tenant folder
fs
  .readdirSync(__dirname + '/tenant')
  .filter(file =>
      (file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js'))
  .forEach(file => {
      // const model = db.tenant.import(path.join(__dirname + '/tenant', file));
      const model = require(path.join(__dirname + '/tenant', file))(db.tenant, Sequelize.DataTypes);
      db.model.tenant[model.name] = model;
  });

Object.keys(db.model.main).forEach((modelName) => {
  if (db.main.models[modelName].associate) {
    db.main.models[modelName].associate(db);
  }
});

Object.keys(db.model.tenant).forEach((modelName) => {
  if (db.tenant.model[modelName].associate) {
    db.tenant.model[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;

module.exports = db;
/* eslint-enable */
