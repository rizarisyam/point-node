const setupTestDbTenant = require('../../../../../tests/utils/setupTestDbTenant');
const { User, Permission, ModelHasPermission } = require('../../../../models').tenant;

setupTestDbTenant();

describe('User Model', () => {
  describe('#create', () => {
    it('create user with valid attributes', async () => {
      const user = await User.create({
        email: 'john.doe@mail.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        address: 'Jakarta',
        phone: '085209090909',
      });
      expect(user.email).toEqual('john.doe@mail.com');
      expect(user.name).toEqual('John Doe');
    });
  });

  describe('instance#isPermitted', () => {
    it('return true if user permitted', async () => {
      const user = await User.create({
        email: 'john.doe@mail.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        address: 'Jakarta',
        phone: '085209090909',
      });
      const [createUserPermission, updateUserPermission, deleteUserPermission] = await Promise.all([
        Permission.create({
          name: 'create user',
          guardName: 'api',
        }),
        Permission.create({
          name: 'update user',
          guardName: 'api',
        }),
        Permission.create({
          name: 'delete user',
          guardName: 'api',
        }),
      ]);
      await Promise.all([
        ModelHasPermission.create({
          permissionId: createUserPermission.id,
          modelId: user.id,
          modelType: 'User',
        }),
        ModelHasPermission.create({
          permissionId: updateUserPermission.id,
          modelId: user.id,
          modelType: 'User',
        }),
        ModelHasPermission.create({
          permissionId: deleteUserPermission.id,
          modelId: user.id,
          modelType: 'User',
        }),
      ]);
      const isPermitted = await user.isPermitted(['create user', 'update user', 'delete user']);
      expect(isPermitted).toBeTruthy();
    });

    it('return true if user not permitted', async () => {
      const user = await User.create({
        email: 'john.doe@mail.com',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        address: 'Jakarta',
        phone: '085209090909',
      });
      const [createUserPermission] = await Promise.all([
        Permission.create({
          name: 'create users',
          guardName: 'api',
        }),
        Permission.create({
          name: 'update users',
          guardName: 'api',
        }),
      ]);
      await ModelHasPermission.create({
        permissionId: createUserPermission.id,
        modelId: user.id,
        modelType: 'User',
      });
      const isPermitted = await user.isPermitted(['create user', 'update user']);
      expect(isPermitted).toBeFalsy();
    });
  });
});
