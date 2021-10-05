const httpStatus = require('http-status');
const catchAsync = require('@src/utils/catchAsync');
const getAllSalesInvoiceService = require('./services/getAll.salesInvoice.service');
const getAllReferenceFormSalesInvoiceService = require('./services/getAllReferenceForm.salesInvoice.service');
const createFormRequestSalesInvoiceService = require('./services/createFormRequest.salesInvoice.service');
const createFormApproveSalesInvoiceService = require('./services/createFormApprove.salesInvoice.service');
const createFormApproveByTokenSalesInvoiceService = require('./services/createFormApproveByToken.salesInvoice.service');
const createFormRejectSalesInvoiceService = require('./services/createFormReject.salesInvoice.service');
const createFormRejectByTokenSalesInvoiceService = require('./services/createFormRejectByToken.salesInvoice.service');
const updateFormSalesInvoiceServiceService = require('./services/updateForm.salesInvoice.service');
const deleteFormRequestSalesInvoiceService = require('./services/deleteFormRequest.salesInvoice.service');
const deleteFormApproveSalesInvoiceService = require('./services/deleteFormApprove.salesInvoice.service');
const deleteFormRejectSalesInvoiceService = require('./services/deleteFormReject.salesInvoice.service');
const getOneSalesInvoiceService = require('./services/getOne.salesInvoice.service');

const getAllSalesInvoice = catchAsync(async (req, res) => {
  const { currentTenantDatabase, query: queries } = req;
  const { total, salesInvoices } = await getAllSalesInvoiceService({ currentTenantDatabase, queries });
  res.status(httpStatus.OK).send({
    data: salesInvoices,
    links: {
      first: '',
      last: '',
      next: '',
      prev: '',
    },
    meta: {
      current_page: parseInt(queries.page || 1, 10),
      from: 1,
      last_page: Math.ceil(total / parseInt(queries.limit, 10)) || 1,
      path: '',
      per_page: parseInt(queries.limit || 10, 10),
      to: 1,
      total,
    },
  });
});

const getAllFormReferenceSalesInvoice = catchAsync(async (req, res) => {
  const { currentTenantDatabase, query: queries } = req;
  const { total, formReferences } = await getAllReferenceFormSalesInvoiceService({ currentTenantDatabase, queries });
  res.status(httpStatus.OK).send({
    data: formReferences,
    links: {
      first: '',
      last: '',
      next: '',
      prev: '',
    },
    meta: {
      current_page: parseInt(queries.page, 10),
      from: 1,
      last_page: Math.ceil(total / parseInt(queries.limit, 10)),
      path: '',
      per_page: parseInt(queries.limit, 10),
      to: 1,
      total,
    },
  });
});

const getOneSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    params: { salesInvoiceId },
  } = req;
  const { salesInvoice } = await getOneSalesInvoiceService({ currentTenantDatabase, salesInvoiceId });
  res.status(httpStatus.OK).send({ data: salesInvoice });
});

const createFormRequestSalesInvoice = catchAsync(async (req, res) => {
  const { currentTenantDatabase, user: maker, body: createSalesInvoiceDto } = req;
  const salesInvoice = await createFormRequestSalesInvoiceService({ currentTenantDatabase, maker, createSalesInvoiceDto });
  res.status(httpStatus.CREATED).send({ data: salesInvoice });
});

const createFormApproveSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: approver,
    params: { salesInvoiceId },
  } = req;
  const { salesInvoice } = await createFormApproveSalesInvoiceService({ currentTenantDatabase, approver, salesInvoiceId });
  res.status(httpStatus.OK).send({ data: salesInvoice });
});

const createFormApproveByTokenSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    body: { token },
  } = req;

  const { salesInvoice } = await createFormApproveByTokenSalesInvoiceService({ currentTenantDatabase, token });
  res.status(httpStatus.OK).send({ data: salesInvoice });
});

const createFormRejectSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: approver,
    params: { salesInvoiceId },
    body: createFormRejectSalesInvoiceDto,
  } = req;
  const salesInvoice = await createFormRejectSalesInvoiceService({
    currentTenantDatabase,
    approver,
    salesInvoiceId,
    createFormRejectSalesInvoiceDto,
  });
  res.status(httpStatus.OK).send({ salesInvoice });
});

const createFormRejectByTokenSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    body: { token },
  } = req;

  const { salesInvoice } = await createFormRejectByTokenSalesInvoiceService({ currentTenantDatabase, token });
  res.status(httpStatus.OK).send({ data: salesInvoice });
});

const updateFormSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: maker,
    params: { salesInvoiceId },
    body: updateFormSalesInvoiceDto,
  } = req;
  const { salesInvoice } = await updateFormSalesInvoiceServiceService({
    currentTenantDatabase,
    maker,
    salesInvoiceId,
    updateFormSalesInvoiceDto,
  });
  res.status(httpStatus.OK).send({ data: { salesInvoice } });
});

const deleteFormRequestSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: maker,
    params: { salesInvoiceId },
    body: deleteFormRequestSalesInvoiceDto,
  } = req;
  const { salesInvoice } = await deleteFormRequestSalesInvoiceService({
    currentTenantDatabase,
    maker,
    salesInvoiceId,
    deleteFormRequestSalesInvoiceDto,
  });
  res.status(httpStatus.OK).send({ salesInvoice });
});

const deleteFormApproveSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: approver,
    params: { salesInvoiceId },
  } = req;
  const { salesInvoice } = await deleteFormApproveSalesInvoiceService({ currentTenantDatabase, approver, salesInvoiceId });
  res.status(httpStatus.OK).send({ salesInvoice });
});

const deleteFormRejectSalesInvoice = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: approver,
    params: { salesInvoiceId },
    body: deleteFormRejectSalesInvoiceDto,
  } = req;
  const { salesInvoice } = await deleteFormRejectSalesInvoiceService({
    currentTenantDatabase,
    approver,
    salesInvoiceId,
    deleteFormRejectSalesInvoiceDto,
  });
  res.status(httpStatus.OK).send({ salesInvoice });
});

module.exports = {
  getAllSalesInvoice,
  getAllFormReferenceSalesInvoice,
  getOneSalesInvoice,
  createFormRequestSalesInvoice,
  createFormApproveSalesInvoice,
  createFormApproveByTokenSalesInvoice,
  createFormRejectSalesInvoice,
  createFormRejectByTokenSalesInvoice,
  updateFormSalesInvoice,
  deleteFormRequestSalesInvoice,
  deleteFormApproveSalesInvoice,
  deleteFormRejectSalesInvoice,
};
