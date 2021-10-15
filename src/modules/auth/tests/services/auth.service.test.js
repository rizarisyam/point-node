const passport = require('passport');
const httpStatus = require('http-status');
const { User, Permission, ModelHasPermission } = require('@src/models').tenant;
const currentTenantDatabase = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');
const auth = require('../../services/auth.service');

const errorForbidden = new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
const errorUnauthorized = new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');

describe('Auth - Auth Service', () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });
  it('calls next with error forbidden when user does not have permissions', async () => {
    const user = await User.create({
      email: 'john.doe@mail.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
    });
    req.params = {
      userId: user.id,
    };
    const payload = {
      sub: user.id,
    };

    req.currentTenantDatabase = currentTenantDatabase;
    passport.authenticate = jest.fn((authType, options, callback) => () => {
      callback(null, payload, null);
    });

    await auth('create user')(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(errorForbidden);
  });

  it('calls next with error unauthorized when user does not exist', async () => {
    passport.authenticate = jest.fn((authType, options, callback) => () => {
      callback(null, null, null);
    });

    await auth('create user')(req, res, next);
    expect(next).toBeCalledTimes(1);
    expect(next).toBeCalledWith(errorUnauthorized);
  });

  it('calls next with no error', async () => {
    const user = await User.create({
      email: 'john.doe@mail.com',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
    });
    const createUserPermission = await Permission.create({
      name: 'create user',
      guardName: 'api',
    });
    await ModelHasPermission.create({
      modelId: user.id,
      modelType: 'User',
      permissionId: createUserPermission.id,
    });
    req.params = {
      userId: user.id,
    };
    const payload = {
      sub: user.id,
    };

    req.currentTenantDatabase = currentTenantDatabase;
    passport.authenticate = jest.fn((authType, options, callback) => () => {
      callback(null, payload, null);
    });

    await auth('create user')(req, res, next);
    expect(next).toBeCalledTimes(1);
  });
});
