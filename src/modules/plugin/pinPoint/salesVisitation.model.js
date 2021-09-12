const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalesVisitation extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.Form, { onDelete: 'CASCADE' });

      this.belongsTo(models.Customer, { onDelete: 'RESTRICT' });

      this.belongsTo(models.Warehouse, { onDelete: 'RESTRICT' });
    }
  }
  SalesVisitation.init(
    {
      formId: {
        type: DataTypes.INTEGER,
      },
      customerId: {
        type: DataTypes.INTEGER,
      },
      branchId: {
        type: DataTypes.INTEGER,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING,
      },
      group: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
      },
      district: {
        type: DataTypes.STRING,
      },
      subDistrict: {
        type: DataTypes.STRING,
      },
      phone: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.STRING,
      },
      longitude: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      paymentMethod: {
        type: DataTypes.STRING,
      },
      dueDate: {
        type: DataTypes.DATE,
      },
      paymentReceived: {
        type: DataTypes.DECIMAL,
      },
      isRepeatOrder: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'SalesVisitation',
      tableName: 'pin_point_sales_visitations',
      underscored: true,
    }
  );
  return SalesVisitation;
};
