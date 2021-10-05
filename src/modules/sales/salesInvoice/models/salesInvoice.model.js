const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class SalesInvoice extends Model {
    static associate({ [projectCode]: models }) {
      this.hasMany(models.SalesInvoiceItem, { as: 'items' });

      this.belongsTo(models.Customer, { as: 'customer' });

      this.belongsTo(models.DeliveryNote, { as: 'salesDeliveryNote', foreignKey: 'referenceableId', constraints: false });

      this.belongsTo(models.SalesVisitation, { as: 'salesVisitation', foreignKey: 'referenceableId', constraints: false });

      this.hasOne(models.Form, {
        as: 'form',
        foreignKey: 'formableId',
        constraints: false,
        scope: { formable_type: 'SalesInvoice' },
      });
    }

    getReferenceable(options) {
      const referenceableTypes = ['SalesDeliveryNote', 'SalesVisitation'];
      if (!referenceableTypes.includes(this.referenceableType)) return Promise.resolve(null);
      const mixinMethodName = `get${this.referenceableType}`;
      return this[mixinMethodName](options);
    }

    getDiscountString() {
      if (this.discountValue && this.discountValue > 0) {
        return `${this.discountValue}`;
      }

      if (this.discountPercent && this.discountPercent > 0) {
        return `${this.discountPercent} %`;
      }

      return '';
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
      referenceableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      referenceableType: {
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
