const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  Role.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      guardName: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      underscored: true,
    }
  );
  return Role;
};
