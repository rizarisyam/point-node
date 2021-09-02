const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const createSalesInvoice = require('./services/createRequest.service');

const create = catchAsync(async (req, res) => {
  const salesInvoice = await createSalesInvoice(req.body);
  res.status(httpStatus.CREATED).send({ salesInvoice });
});

module.exports = {
  create,
};
