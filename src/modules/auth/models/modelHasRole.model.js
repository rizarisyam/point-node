const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ModelHasRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.Role);
    }
  }
  ModelHasRole.init(
    {
      roleId: {
        type: DataTypes.INTEGER,
      },
      modelId: {
        type: DataTypes.INTEGER,
      },
      modelType: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'ModelHasRole',
      tableName: 'model_has_roles',
      underscored: true,
    }
  );
  return ModelHasRole;
};
