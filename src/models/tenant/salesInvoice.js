const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalesInvoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.Customer, { foreignKey: 'customerId', onDelete: 'RESTRICT' });
      this.hasMany(models.SalesInvoiceItem, { as: 'items' });
      this.hasOne(models.Form, {
        foreignKey: 'formableId',
        constraints: false,
        scope: { formableType: 'SalesInvoice' },
      });
    }

    getFormable(options) {
      if (!this.paymentMethodableId || !this.paymentMethodableType) {
        return Promise.resolve(null);
      }

      const mixinMethodName = `get${this.paymentMethodableType}`;
      return this[mixinMethodName](options);
    }
  }
  SalesInvoice.init(
    {
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.INTEGER,
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
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deliveryFee: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      discountPercent: {
        type: DataTypes.DECIMAL,
      },
      discountValue: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      typeOfTax: {
        type: DataTypes.STRING,
        validate: {
          isIn: [['include', 'exclude', 'non']],
        },
      },
      tax: {
        type: DataTypes.DECIMAL,
      },
      amount: {
        type: DataTypes.DECIMAL,
      },
      remaining: {
        type: DataTypes.DECIMAL,
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
