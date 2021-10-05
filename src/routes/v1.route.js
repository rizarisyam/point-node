const express = require('express');
const setupDatabase = require('@src/middlewares/setupDatabase');
const config = require('../config/config');
const salesInvoiceRoute = require('../modules/sales/salesInvoice/routes');
const authRoute = require('../modules/auth/routes');

const router = express.Router();

router.get('/status', (req, res) => {
  res.status(200).send('OK');
});

const defaultRoutes = [
  {
    path: '/sales/invoices',
    route: salesInvoiceRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
];

const devRoutes = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, setupDatabase, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
