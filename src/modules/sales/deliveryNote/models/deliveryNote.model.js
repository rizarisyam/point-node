const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryNote extends Model {
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'customerId', onDelete: 'RESTRICT' });

      this.belongsTo(models.Warehouse, { onDelete: 'RESTRICT' });

      // this.hasMany(models.DeliveryNoteItem, { as: 'items' });

      this.hasOne(models.Form, {
        foreignKey: 'formableId',
        constraints: false,
        scope: { formableType: 'DeliveryNote' },
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
  DeliveryNote.init(
    {
      customerId: {
        type: DataTypes.INTEGER,
      },
      customerAddress: {
        type: DataTypes.STRING,
      },
      customerPhone: {
        type: DataTypes.STRING,
      },
      billingAddress: {
        type: DataTypes.STRING,
      },
      billingPhone: {
        type: DataTypes.STRING,
      },
      billingEmail: {
        type: DataTypes.STRING,
      },
      shippingAddress: {
        type: DataTypes.STRING,
      },
      shippingPhone: {
        type: DataTypes.STRING,
      },
      shippingEmail: {
        type: DataTypes.STRING,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      deliveryOrderId: {
        type: DataTypes.INTEGER,
      },
      driver: {
        type: DataTypes.STRING,
      },
      licensePlate: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'DeliveryNote',
      tableName: 'delivery_notes',
      underscored: true,
    }
  );
  return DeliveryNote;
};
