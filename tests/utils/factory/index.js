const branch = require('./branch');
const branchUser = require('./branchUser');
const customer = require('./customer');
const deliveryNote = require('./deliveryNote');
const deliveryNoteItem = require('./deliveryNoteItem');
const deliveryOrder = require('./deliveryOrder');
const form = require('./form');
const item = require('./item');
const itemUnit = require('./itemUnit');
const user = require('./user');
const userWarehouse = require('./userWarehouse');
const warehouse = require('./warehouse');

const factory = {
  branch,
  branchUser,
  customer,
  deliveryNote,
  deliveryNoteItem,
  deliveryOrder,
  form,
  item,
  itemUnit,
  user,
  userWarehouse,
  warehouse,
};

module.exports = factory;
