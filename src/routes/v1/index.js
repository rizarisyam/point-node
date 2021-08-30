const express = require('express');
const config = require('../../config/config');
const { User } = require('../../models').main;

const router = express.Router();

router.get('/status', (req, res) => {
  res.status(200).send('OK');
});

const defaultRoutes = [];

const devRoutes = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
