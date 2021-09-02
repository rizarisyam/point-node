const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RoleHasPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.Permission);
      this.belongsTo(models.Role);
    }
  }
  RoleHasPermission.init(
    {
      permissionId: {
        type: DataTypes.INTEGER,
      },
      roleId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'RoleHasPermission',
      tableName: 'role_has_permissions',
      underscored: true,
    }
  );
  return RoleHasPermission;
};
