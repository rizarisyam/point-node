const express = require('express');
const config = require('../config/config');
const salesInvoiceRoute = require('../modules/sales/salesInvoice/routes');

const router = express.Router();

router.get('/status', (req, res) => {
  res.status(200).send('OK');
});

const defaultRoutes = [
  {
    path: '/sales/salesInvoice',
    route: salesInvoiceRoute,
  },
];

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
