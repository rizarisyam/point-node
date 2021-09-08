const express = require('express');
const { celebrate } = require('celebrate');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

router.route('/generate-token').post(celebrate(requestValidations.generateToken), controller.generateToken);

module.exports = router;
