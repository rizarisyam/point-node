const { Joi } = require('celebrate');
const moment = require('moment');

const requireAuth = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
};

const requireSalesInvoiceId = {
  params: {
    salesInvoiceId: Joi.number().required(),
  },
};

const createFormRequestSalesInvoice = {
  body: Joi.object({
    formId: Joi.number().required(),
    items: Joi.array().items({
      itemId: Joi.number().required(),
      referenceItemId: Joi.number().required(),
      quantity: Joi.number().min(0).required(),
      itemUnit: Joi.string().required(),
      allocationId: Joi.number().allow(null),
      price: Joi.number().required(),
      discountPercent: Joi.number().min(0).max(100).default(0),
      discountValue: Joi.number().min(0).default(0),
    }),
    requestApprovalTo: Joi.number().required(),
    dueDate: Joi.date().iso().min(moment().format('YYYY-MM-DD 00:00:00')).required(),
    discountPercent: Joi.number().min(0).max(100).default(0),
    discountValue: Joi.number().min(0).default(0),
    customerId: Joi.number().required(),
    typeOfTax: Joi.string().valid('include', 'exclude', 'non').required(),
    notes: Joi.string().allow(null).default(''),
  }),
};

const createFormRejectSalesInvoice = {
  body: Joi.object({
    reason: Joi.string().allow(null).default(''),
  }),
};

const deleteFormRequestSalesInvoice = {
  body: Joi.object({
    reason: Joi.string().allow(null).default(''),
  }),
};

const deleteFormRejectSalesInvoice = {
  body: Joi.object({
    reason: Joi.string().allow(null).default(''),
  }),
};

const updateFormSalesInvoice = {
  body: Joi.object({
    id: Joi.number().required(),
    items: Joi.array().items({
      salesInvoiceItemId: Joi.number().required(),
      allocationId: Joi.number().allow(null),
      discountPercent: Joi.number().min(0).max(100).default(0),
      discountValue: Joi.number().min(0).default(0),
    }),
    requestApprovalTo: Joi.number().required(),
    dueDate: Joi.date().iso().min(moment().format('YYYY-MM-DD 00:00:00')).required(),
    discountPercent: Joi.number().min(0).max(100).default(0),
    discountValue: Joi.number().min(0).default(0),
    typeOfTax: Joi.string().valid('include', 'exclude', 'non').required(),
    notes: Joi.string().allow(null).default(''),
  }),
};

const createFormApproveByTokenSalesInvoice = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

const createFormRejectByTokenSalesInvoice = {
  body: Joi.object({
    token: Joi.string().required(),
  }),
};

module.exports = {
  requireAuth,
  createFormRequestSalesInvoice,
  requireSalesInvoiceId,
  createFormRejectSalesInvoice,
  deleteFormRequestSalesInvoice,
  deleteFormRejectSalesInvoice,
  updateFormSalesInvoice,
  createFormApproveByTokenSalesInvoice,
  createFormRejectByTokenSalesInvoice,
};
