const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, payload, info) => {
  if (err || info || !payload) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  const { User } = req.currentTenantDatabase;
  const user = await User.findOne({ where: { id: payload.sub } });
  if (!user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  if (requiredRights.length) {
    const hasRequiredRights = await user.isPermitted(requiredRights);
    if (!hasRequiredRights) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  req.user = user;
  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

module.exports = auth;
