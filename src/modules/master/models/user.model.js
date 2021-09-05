const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.hasMany(models.ModelHasPermission, {
        foreignKey: 'modelId',
        constraints: false,
        scope: { modelType: 'User' },
      });
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
