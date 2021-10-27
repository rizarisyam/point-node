const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class DeliveryNoteItem extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.DeliveryNote, { onDelete: 'CASCADE' });

      this.belongsTo(models.Item, { onDelete: 'RESTRICT' });

      this.belongsTo(models.Allocation, { as: 'allocation', onDelete: 'RESTRICT' });

      this.belongsTo(models.DeliveryOrderItem, { as: 'deliveryOrderItem' });
    }
  }
  DeliveryNoteItem.init(
    {
      deliveryNoteId: {
        type: DataTypes.INTEGER,
      },
      deliveryOrderItemId: {
        type: DataTypes.INTEGER,
      },
      itemId: {
        type: DataTypes.INTEGER,
      },
      itemName: {
        type: DataTypes.STRING,
      },
      grossWeight: {
        type: DataTypes.DECIMAL,
      },
      tareWeight: {
        type: DataTypes.DECIMAL,
      },
      netWeight: {
        type: DataTypes.DECIMAL,
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
      price: {
        type: DataTypes.DECIMAL,
      },
      discountPercent: {
        type: DataTypes.DECIMAL,
      },
      discountValue: {
        type: DataTypes.DECIMAL,
      },
      taxable: {
        type: DataTypes.BOOLEAN,
      },
      unit: {
        type: DataTypes.STRING,
      },
      converter: {
        type: DataTypes.DECIMAL,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      allocationId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'DeliveryNoteItem',
      tableName: 'delivery_note_items',
      underscored: true,
      timestamps: false,
    }
  );
  return DeliveryNoteItem;
};
