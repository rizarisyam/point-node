const express = require('express');
const auth = require('@src/modules/auth/services/auth.service');
const controller = require('./controller');

const router = express.Router();

router.route('/').post(auth('create Form'), controller.createFormRequestSalesInvoice);

router.route('/:formId').put(auth('update Form'), controller.updateFormSalesInvoice);

router.route('/:formId/create-approve').put(auth('manage Form'), controller.createFormApproveSalesInvoice);

router.route('/:formId/create-reject').put(auth('manage Form'), controller.createFormRejectSalesInvoice);

router.route('/:formId').delete(auth('delete Form'), controller.deleteFormRequestSalesInvoice);

router.route('/:formId/delete-approve').put(auth('manage Form'), controller.deleteFormApproveSalesInvoice);

router.route('/:formId/delete-reject').put(auth('manage Form'), controller.deleteFormRejectSalesInvoice);

module.exports = router;
