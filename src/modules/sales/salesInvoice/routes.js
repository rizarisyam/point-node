const express = require('express');
const { celebrate } = require('celebrate');
const auth = require('@src/modules/auth/services/auth.service');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

router
  .route('/')
  .post(
    celebrate(requestValidations.createFormRequestSalesInvoice),
    auth('create Form'),
    controller.createFormRequestSalesInvoice
  );

router.route('/:formId').put(auth('update sales invoice'), controller.updateFormSalesInvoice);

router.route('/:formId/create-approve').put(auth('approve sales invoice'), controller.createFormApproveSalesInvoice);

router.route('/:formId/create-reject').put(auth('approve sales invoice'), controller.createFormRejectSalesInvoice);

router.route('/:formId').delete(auth('delete sales invoice'), controller.deleteFormRequestSalesInvoice);

router.route('/:formId/delete-approve').put(auth('approve sales invoice'), controller.deleteFormApproveSalesInvoice);

router.route('/:formId/delete-reject').put(auth('approve sales invoice'), controller.deleteFormRejectSalesInvoice);

module.exports = router;
