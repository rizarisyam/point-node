const path = require('path');

const modulesDir = `${__dirname}/../modules`;
const modelPaths = [
  // master
  '/master/models/branch.model.js',
  '/master/models/branchUser.model.js',
  '/master/models/customer.model.js',
  '/master/models/user.model.js',
  '/master/models/userWarehouse.model.js',
  '/master/models/warehouse.model.js',
  // sales/salesInvoice
  '/sales/salesInvoice/models/salesInvoice.model.js',
  '/sales/salesInvoice/models/salesInvoiceItem.model.js',
  // sales/deliveryNote
  '/sales/deliveryNote/models/deliveryNote.model.js',
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
