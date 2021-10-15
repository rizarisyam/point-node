const express = require('express');
const { celebrate } = require('celebrate');
const auth = require('@src/modules/auth/services/auth.service');
const multer = require('@src/utils/multer');
const fileValidator = require('@src/utils/fileValidator');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

// GET CURRENT LOGO
router.route('/logo').get(auth(), controller.getSettingLogo);

// UPLOAD COMPANY LOGO
router.route('/logo').post(
  auth(),
  multer({
    options: {
      limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5MB.
      },
    },
  }).single('image'),
  fileValidator(),
  controller.uploadSettingLogo
);

// GET SETTING END NOTE
router.route('/end-note').get(auth(), controller.getSettingEndNote);

// UPDATE SETTING END NOTE
router.route('/end-note').post(celebrate(requestValidations.updateSettingendNote), auth(), controller.updateSettingEndNote);

module.exports = router;
