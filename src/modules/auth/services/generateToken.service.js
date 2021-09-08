/**
 * This service has responsibility to validate token to main app and
 * then generate new token which will be used for this application
 */

const axios = require('axios');
const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const token = require('./token.service');

async function generateTokenService(generateTokenDto) {
  try {
    const { id, email, accessToken } = generateTokenDto;
    const {
      data: { data },
    } = await axios.post(
      'https://api.point.red/api/v1/auth/fetch',
      {
        access_token: accessToken,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (data.id === id && data.email === email) {
      const jwtoken = token.generateToken(data.id);

      return jwtoken;
    }

    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  } catch (e) {
    if (e?.response?.status === 401) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    } else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error');
    }
  }
}

module.exports = generateTokenService;
