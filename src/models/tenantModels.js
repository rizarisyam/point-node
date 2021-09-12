const path = require('path');

const modulesDir = `${__dirname}/../modules`;
const modelPaths = [
  // master
  '/master/models/allocation.model.js',
  '/master/models/branch.model.js',
  '/master/models/branchUser.model.js',
  '/master/models/customer.model.js',
  '/master/models/item.model.js',
  '/master/models/user.model.js',
  '/master/models/userWarehouse.model.js',
  '/master/models/warehouse.model.js',
  // auth
  '/auth/models/modelHasPermission.model.js',
  '/auth/models/modelHasRole.model.js',
  '/auth/models/permission.model.js',
  '/auth/models/role.model.js',
  '/auth/models/roleHasPermission.model.js',
  // sales/deliveryNote
  '/sales/deliveryNote/models/deliveryNote.model.js',
  '/sales/deliveryNote/models/deliveryNoteItem.model.js',
  // sales/deliveryOrder
  '/sales/deliveryOrder/models/deliveryOrder.model.js',
  // sales/salesInvoice
  '/sales/salesInvoice/models/salesInvoice.model.js',
  '/sales/salesInvoice/models/salesInvoiceItem.model.js',
  // pos
  '/pos/models/posBill.model.js',
  // plugin/pinpoint
  '/plugin/pinPoint/salesVisitation.model.js',
  // shared
  '/shared/form/form.model.js',
].map((modelPath) => path.join(modulesDir, modelPath));

module.exports = {
  modelPaths,
  modulesDir,
};
