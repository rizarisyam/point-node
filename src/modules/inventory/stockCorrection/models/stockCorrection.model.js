const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StockCorrection extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.Warehouse, { as: 'warehouse', onUpdate: 'RESTRICT', onDelete: 'RESTRICT' });
    }
  }
  StockCorrection.init(
    {
      warehouseId: {
        type: DataTypes.INTEGER.UNSIGNED,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'StockCorrection',
      tableName: 'stock_corrections',
      underscored: true,
      timestamps: false,
    }
  );
  return StockCorrection;
};
