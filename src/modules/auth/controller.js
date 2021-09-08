// https://api.point.red/api/v1/auth/fetch

const httpStatus = require('http-status');
const catchAsync = require('@src/utils/catchAsync');
const generateTokenService = require('./services/generateToken.service');

const generateToken = catchAsync(async (req, res) => {
  const jwtoken = await generateTokenService(req.body);
  res.status(httpStatus.OK).send({ token: jwtoken });
});

module.exports = {
  generateToken,
};
