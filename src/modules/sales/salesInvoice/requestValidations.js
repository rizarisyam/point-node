const { Joi } = require('celebrate');

const createFormRequestSalesInvoice = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object({
    formId: Joi.number().required(),
    items: Joi.array().items({
      itemId: Joi.number().required(),
      itemReferenceId: Joi.number().required(),
      quantity: Joi.number().positive().required(),
      itemUnitId: Joi.number().required(),
      allocationId: Joi.number().required(),
      price: Joi.number().required(),
      discountPercent: Joi.number().min(0).max(1).positive().default(0),
      discountValue: Joi.number().positive().default(0),
    }),
    createdBy: Joi.number().required(),
    requestApprovalTo: Joi.number().required(),
    dueDate: Joi.date().iso().min('now').required(),
    discountPercent: Joi.number().min(0).max(1).positive().default(0),
    discountValue: Joi.number().positive().default(0),
    customerId: Joi.number().required(),
    typeOfTax: Joi.string().valid('include', 'exclude', 'non').required(),
    notes: Joi.string().default(''),
  }),
};

module.exports = {
  createFormRequestSalesInvoice,
};
