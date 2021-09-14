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
      amount: {
        type: DataTypes.DECIMAL,
      },
      remaining: {
        type: DataTypes.DECIMAL,
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
      timestamps: false,
    }
  );
  return SalesInvoice;
};
