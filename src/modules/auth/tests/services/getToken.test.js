const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const activateNockBack = require('@root/tests/utils/activateNockBack');
const getTokenService = require('../../services/getToken.service');

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
      const result = await getTokenService(generateTokenDto);
      expect(result.length).not.toEqual(0);
    });
  });

  describe('when failed', () => {
    it.nock('throw error when request with invalid token', async () => {
      const generateTokenDto = {
        id: 2599,
        email: 'bosgagitu@gmail.com',
        accessToken: 'invalid-token',
      };
      await expect(async () => {
        await getTokenService(generateTokenDto);
      }).rejects.toThrow(unauthorizedError);
    });

    it.nock('throw error when email not same with email that receive from main app', async () => {
      const generateTokenDto = {
        id: 2599,
        email: 'invalid-email@gmail.com',
        accessToken:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZDM3MzJiOTBmZjczMGJlZTY5MzM1YmUyNmE5MzA1YTE3YTcyZTNmZGQ3ZDFkZjdkYmE0ZmE0M2UyZmQzZjFjNjUyNzcwNjY1NzQ4ODI1YmYiLCJpYXQiOjE2MzEwNTg4MDEsIm5iZiI6MTYzMTA1ODgwMSwiZXhwIjoxNjYyNTk0ODAxLCJzdWIiOiIyNTk5Iiwic2NvcGVzIjpbXX0.nCVMImlvxukKhul_NXnLi84dljBniXhIPYtMOMBl_0AoiQtffQ9pDtHq0JXisYkohMsWbhpPu2S1lTCbhWhlYJfjtVAyU8-hTOw1prNZYiU42rmn_2A8QJT10wOpo5YSUyX7Je0bBh7mRccXShbohwL4hcoyMBA4tmw0BOpMXfzR0YigDaT3bsCWz5IoqTQgcNk3VC3Ga6UqnBlu_IA_N_qxLYz7CYGuLyY2iyaZyr9TS3oy16bJagUEJWLc7YAmglNsb8PktfktdSuY_HRV2JkJjMqrzVQKV87H79lmfe-OVLaiYXiLYoD6LRkKXnu5A2EhVgRtxDatZANhuMdrhtXsTdGkt8ETB-H_sqyi-ms-HpRzleDXx0caI8O9nZwFO2kS1w7eM1j2kLcIaw3rKGmmIV9XFrTXBbF5Sx75cFnjfjahZFpzJ2JhYOn4qUEXAD8xbCAqDR9eseeqv0bjMS6YHy0_T6o4bQSgPPrBcV9LVy4kXAInTZ4zTy4g36CogUqlWqfd4R9882BkwWXT9myJpJ4oMUWmaTduB0PGDX2lc_UM2nrjtJnGuRSWmIf2rv9iJoOM1wCmImPcjyoc4FOzvlDbW06J_m_b35EUbjN12nsJH1smcOxm9HIRdQTUyo4G2cLo7CQ49xcy5JTkOt2f4DnXBto3HpVqDDqdU6s',
      };
      await expect(async () => {
        await getTokenService(generateTokenDto);
      }).rejects.toThrow(unauthorizedError);
    });
  });
});
