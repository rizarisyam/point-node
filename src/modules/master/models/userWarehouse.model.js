const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserWarehouse extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.User, { onDelete: 'CASCADE' });

      this.belongsTo(models.Warehouse, { onDelete: 'CASCADE' });
    }
  }
  UserWarehouse.init(
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'UserWarehouse',
      tableName: 'user_warehouse',
      underscored: true,
      timestamps: false,
    }
  );
  return UserWarehouse;
};
