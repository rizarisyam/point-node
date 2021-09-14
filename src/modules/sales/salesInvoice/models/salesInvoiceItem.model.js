const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalesInvoiceItem extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.SalesInvoice, { onDelete: 'CASCADE' });

      this.belongsTo(models.DeliveryNote, { onDelete: 'CASCADE' });

      this.belongsTo(models.DeliveryNoteItem, { onDelete: 'CASCADE' });

      this.belongsTo(models.Item, { onDelete: 'RESTRICT' });

      this.belongsTo(models.Allocation, { onDelete: 'RESTRICT' });

      this.belongsTo(models.DeliveryNote, { foreignKey: 'deliveryNoteId', constraints: false });

      this.belongsTo(models.PosBill, { foreignKey: 'deliveryNoteId', constraints: false });

      this.belongsTo(models.SalesVisitation, { foreignKey: 'deliveryNoteId', constraints: false });
    }
  }
  SalesInvoiceItem.init(
    {
      salesInvoiceId: {
        type: DataTypes.INTEGER,
      },
      deliveryNoteId: {
        type: DataTypes.INTEGER,
      },
      deliveryNoteItemId: {
        type: DataTypes.INTEGER,
      },
      itemId: {
        type: DataTypes.INTEGER,
      },
      itemName: {
        type: DataTypes.STRING,
      },
      quantity: {
        type: DataTypes.DECIMAL,
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
      modelName: 'SalesInvoiceItem',
      tableName: 'sales_invoice_items',
      underscored: true,
      timestamps: false,
    }
  );
  return SalesInvoiceItem;
};
