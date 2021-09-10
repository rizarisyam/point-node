const { Joi } = require('celebrate');

const createFormRequestSalesInvoice = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object({
    formId: Joi.number().required(),
    items: Joi.array().items({
      itemId: Joi.number().required(),
      quantity: Joi.number().positive().required(),
      itemUnitId: Joi.number().required(),
      allocationId: Joi.number().required(),
      price: Joi.number().required(),
      discount: Joi.object({
        percent: Joi.number().min(0).max(1).positive().default(0),
        value: Joi.number().positive().default(0),
      }),
    }),
    createdBy: Joi.number().required(),
    requestApprovalTo: Joi.number().required(),
    dueDate: Joi.date().iso().min('now').required(),
    discount: Joi.object({
      percent: Joi.number().min(0).max(1).positive().default(0),
      value: Joi.number().positive().default(0),
    }),
    customerId: Joi.number().required(),
    typeOfTax: Joi.string().valid('include', 'exclude', 'non').required(),
    notes: Joi.string().default(''),
  }),
};

module.exports = {
  createFormRequestSalesInvoice,
};
