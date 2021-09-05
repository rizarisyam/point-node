const path = require('path');

const modulesDir = `${__dirname}/../modules`;
const modelPaths = [
  // master
  '/master/models/customer.model.js',
  '/master/models/user.model.js',
  // sales/salesInvoice
  '/sales/salesInvoice/models/salesInvoice.model.js',
  '/sales/salesInvoice/models/salesInvoiceItem.model.js',
  // shared
  '/shared/form/form.model.js',
  // auth
  '/auth/models/modelHasPermission.model.js',
  '/auth/models/modelHasRole.model.js',
  '/auth/models/permission.model.js',
  '/auth/models/role.model.js',
  '/auth/models/roleHasPermission.model.js',
].map((modelPath) => path.join(modulesDir, modelPath));

module.exports = {
  modelPaths,
  modulesDir,
};
