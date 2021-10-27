const { Joi } = require('celebrate');
const moment = require('moment');

const createFormRequest = {
  body: Joi.object({
    warehouseId: Joi.number().required(),
    dueDate: Joi.date().iso().min(moment().format('YYYY-MM-DD 00:00:00')).required(),
    items: Joi.array().items({
      itemId: Joi.number().required(),
      stockCorrection: Joi.number().required(),
      notes: Joi.string().default('').allow(null).max(255),
    }),
    notes: Joi.string().default('').allow(null).max(255),
    requestApprovalTo: Joi.number().required(),
  }),
};

module.exports = {
  createFormRequest,
};
