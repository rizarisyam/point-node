const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const activateNockBack = require('@root/tests/utils/activateNockBack');
const generateTokenService = require('../../services/generateToken.service');

const unauthorizedError = new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');

activateNockBack();

describe('Auth - Generate Token Service', () => {
  describe('when success', () => {
    it.nock('return new jwt token', async () => {
      const generateTokenDto = {
        id: 2599,
        email: 'bosgagitu@gmail.com',
        accessToken: '[SECRET]',
      };
      const result = await generateTokenService(generateTokenDto);
      expect(result.length).not.toEqual(0);
    });
  });

  describe('when failed', () => {
    it.nock('throw error', async () => {
      const generateTokenDto = {
        id: 2599,
        email: 'bosgagitu@gmail.com',
        accessToken: 'invalid-token',
      };
      await expect(async () => {
        await generateTokenService(generateTokenDto);
      }).rejects.toThrow(unauthorizedError);
    });
  });
});
