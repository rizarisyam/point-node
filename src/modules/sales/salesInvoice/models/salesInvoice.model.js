const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalesInvoice extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.User, { as: 'createdByUser', foreignKey: 'createdBy', onDelete: 'RESTRICT' });

      this.belongsTo(models.Form, { foreignKey: 'formId', onDelete: 'RESTRICT' });

      this.hasMany(models.SalesInvoiceItem, { as: 'items' });

      this.hasOne(models.Form, {
        foreignKey: 'formableId',
        constraints: false,
        scope: { formableType: 'SalesInvoice' },
      });
    }
  }
  SalesInvoice.init(
    {
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      discountPercent: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      discountValue: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      // taxBase = total - discount
      taxBase: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      // include tax
      // (taxBase * 100%) / 110
      // exclude tax
      // taxBase * 10%
      tax: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      typeOfTax: {
        type: DataTypes.STRING,
        validate: {
          isIn: [['include', 'exclude', 'non']],
        },
      },
      // amount || total = taxBase + tax
      amount: {
        type: DataTypes.DECIMAL,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'SalesInvoice',
      tableName: 'sales_invoices',
      underscored: true,
    }
  );
  return SalesInvoice;
};
