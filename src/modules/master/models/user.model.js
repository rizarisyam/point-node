const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate({ tenant: models }) {
      this.hasMany(models.ModelHasPermission, {
        foreignKey: 'modelId',
        constraints: false,
        scope: { modelType: 'User' },
      });

      this.belongsToMany(models.Branch, { foreignKey: 'userId', otherKey: 'branchId', through: models.BranchUser });

      this.belongsToMany(models.Warehouse, { foreignKey: 'userId', otherKey: 'warehouseId', through: models.UserWarehouse });
    }

    async isPermitted(requiredPermissions) {
      const modelHasPermissions = await this.getModelHasPermissions({
        include: sequelize.models.Permission,
      });
      const permissions = modelHasPermissions.map((modelHasPermission) => modelHasPermission.Permission.name);
      return requiredPermissions.every((requiredPermission) => permissions.includes(requiredPermission));
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      branchId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    }
  );
  return User;
};
