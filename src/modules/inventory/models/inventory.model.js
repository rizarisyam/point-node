const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.Warehouse, { onDelete: 'RESTRICT' });

      this.belongsTo(models.Item, { onUpdate: 'CASCADE', onDelete: 'CASCADE' });

      this.belongsTo(models.Form, { onUpdate: 'CASCADE', onDelete: 'CASCADE' });
    }
  }
  Inventory.init(
    {
      formId: {
        type: DataTypes.INTEGER,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      itemId: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.DECIMAL,
      },
      expiryDate: {
        type: DataTypes.DATE,
      },
      productionNumber: {
        type: DataTypes.STRING,
      },
      needRecalculate: {
        type: DataTypes.BOOLEAN,
      },
      quantityReference: {
        type: DataTypes.DECIMAL,
      },
      unitReference: {
        type: DataTypes.STRING,
      },
      converterReference: {
        type: DataTypes.DECIMAL,
      },
      isPosted: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'Inventory',
      tableName: 'inventories',
      underscored: true,
    }
  );
  return Inventory;
};
