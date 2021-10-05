const express = require('express');
const { celebrate } = require('celebrate');
const auth = require('@src/modules/auth/services/auth.service');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

// GET ALL SALES INVOICE
router.route('/').get(auth('read sales invoice'), controller.getAllSalesInvoice);

// GET ALL FORM REFERENCE
router.route('/form-references').get(auth(), controller.getAllFormReferenceSalesInvoice);

// GET ONE SALES INVOICE
router
  .route('/:salesInvoiceId')
  .get(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    auth('read sales invoice'),
    controller.getOneSalesInvoice
  );

// REQUEST CREATING SALES INVOICE
router
  .route('/')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.createFormRequestSalesInvoice),
    auth('create sales invoice'),
    controller.createFormRequestSalesInvoice
  );

// APPROVE CREATING SALES INVOICE
router
  .route('/:salesInvoiceId/approve')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    auth('approve sales invoice'),
    controller.createFormApproveSalesInvoice
  );

// APPROVE USING EMAIL TOKEN
router
  .route('/approve-with-token')
  .post(celebrate(requestValidations.createFormApproveByTokenSalesInvoice), controller.createFormApproveByTokenSalesInvoice);

// REJECT CREATING SALES INVOICE
router
  .route('/:salesInvoiceId/reject')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    celebrate(requestValidations.createFormRejectSalesInvoice),
    auth('approve sales invoice'),
    controller.createFormRejectSalesInvoice
  );

// REJECT USING EMAIL TOKEN
router
  .route('/reject-with-token')
  .post(celebrate(requestValidations.createFormRejectByTokenSalesInvoice), controller.createFormRejectByTokenSalesInvoice);

// REQUEST DELETING SALES INVOICE
router
  .route('/:salesInvoiceId')
  .delete(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    celebrate(requestValidations.deleteFormRequestSalesInvoice),
    auth('delete sales invoice'),
    controller.deleteFormRequestSalesInvoice
  );

// APPROVE DELETING SALES INVOICE
router
  .route('/:salesInvoiceId/cancellation-approve')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    auth('approve sales invoice'),
    controller.deleteFormApproveSalesInvoice
  );

// REJECT DELETING SALES INVOICE
router
  .route('/:salesInvoiceId/cancellation-reject')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    celebrate(requestValidations.deleteFormRejectSalesInvoice),
    auth('approve sales invoice'),
    controller.deleteFormRejectSalesInvoice
  );

// UPDATE FORM SALES INVOICE
router
  .route('/:salesInvoiceId')
  .patch(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.requireSalesInvoiceId),
    celebrate(requestValidations.updateFormSalesInvoice),
    auth('update sales invoice'),
    controller.updateFormSalesInvoice
  );

module.exports = router;
