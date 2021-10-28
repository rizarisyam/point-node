const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StockCorrectionItem extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.StockCorrection, { as: 'stockCorrection', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

      this.belongsTo(models.Item, { as: 'item', onUpdate: 'RESTRICT', onDelete: 'RESTRICT' });
    }
  }
  StockCorrectionItem.init(
    {
      stockCorrectionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      productionNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      converter: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'StockCorrectionItem',
      tableName: 'stock_correction_items',
      underscored: true,
      timestamps: false,
    }
  );
  return StockCorrectionItem;
};
