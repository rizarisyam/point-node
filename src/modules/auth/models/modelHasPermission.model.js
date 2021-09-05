const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModelHasPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.Permission);
      this.belongsTo(models.User, { foreignKey: 'modelId', constraints: false });
    }
  }
  ModelHasPermission.init(
    {
      permissionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      modelId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      modelType: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'ModelHasPermission',
      tableName: 'model_has_permissions',
      underscored: true,
      timestamps: false,
    }
  );
  return ModelHasPermission;
};
