const httpStatus = require('http-status');
const catchAsync = require('@src/utils/catchAsync');
const createFormRequestSalesInvoiceService = require('./services/createFormRequest.salesInvoice.service');
const createFormApproveSalesInvoiceService = require('./services/createFormApprove.salesInvoice.service');
const createFormRejectSalesInvoiceService = require('./services/createFormReject.salesInvoice.service');
const updateFormSalesInvoiceServiceService = require('./services/updateForm.salesInvoice.service');
const deleteFormRequestSalesInvoiceService = require('./services/deleteFormRequest.salesInvoice.service');
const deleteFormApproveSalesInvoiceService = require('./services/deleteFormApprove.salesInvoice.service');
const deleteFormRejectSalesInvoiceService = require('./services/deleteFormReject.salesInvoice.service');

const createFormRequestSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await createFormRequestSalesInvoiceService(req.body);
  res.status(httpStatus.CREATED).send({ salesInvoice });
});

const createFormApproveSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await createFormApproveSalesInvoiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

const createFormRejectSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await createFormRejectSalesInvoiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

const updateFormSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await updateFormSalesInvoiceServiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

const deleteFormRequestSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await deleteFormRequestSalesInvoiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

const deleteFormApproveSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await deleteFormApproveSalesInvoiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

const deleteFormRejectSalesInvoice = catchAsync(async (req, res) => {
  const salesInvoice = await deleteFormRejectSalesInvoiceService(req.body);
  res.status(httpStatus.FOUND).send({ salesInvoice });
});

module.exports = {
  createFormRequestSalesInvoice,
  createFormApproveSalesInvoice,
  createFormRejectSalesInvoice,
  updateFormSalesInvoice,
  deleteFormRequestSalesInvoice,
  deleteFormApproveSalesInvoice,
  deleteFormRejectSalesInvoice,
};
