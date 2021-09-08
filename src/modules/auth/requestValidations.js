const { Joi } = require('celebrate');

const generateToken = {
  body: Joi.object({
    id: Joi.number().required(),
    email: Joi.string().email().required(),
    accessToken: Joi.string().required(),
  }),
};

module.exports = {
  generateToken,
};
