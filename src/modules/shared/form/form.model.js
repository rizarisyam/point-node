const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Form extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ tenant: models }) {
      // define association here
      this.belongsTo(models.User, { as: 'createdByUser', foreignKey: 'createdBy' });
      this.belongsTo(models.User, { as: 'updatedByUser', foreignKey: 'updatedBy' });
      this.belongsTo(models.User, { as: 'requestApprovalToUser', foreignKey: 'requestApprovalTo' });
      this.belongsTo(models.User, { as: 'approvalByUser', foreignKey: 'approvalBy' });
      this.belongsTo(models.User, { as: 'requestCancellationToUser', foreignKey: 'requestCancellationTo' });
      this.belongsTo(models.User, { as: 'requestCancellationByUser', foreignKey: 'requestCancellationBy' });
      this.belongsTo(models.SalesInvoice, { foreignKey: 'formableId', constraints: false });
    }
  }
  Form.init(
    {
      branchId: {
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATE,
      },
      number: {
        type: DataTypes.STRING,
      },
      editedNumber: {
        type: DataTypes.STRING,
      },
      notes: {
        type: DataTypes.TEXT,
      },
      editedNotes: {
        type: DataTypes.TEXT,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
      updatedBy: {
        type: DataTypes.INTEGER,
      },
      done: {
        type: DataTypes.BOOLEAN,
      },
      // "increment" is already used by sequelize
      incrementNumber: {
        type: DataTypes.INTEGER,
        field: 'increment',
      },
      incrementGroup: {
        type: DataTypes.MEDIUMINT,
      },
      formableId: {
        type: DataTypes.INTEGER,
      },
      formableType: {
        type: DataTypes.STRING,
      },
      requestApprovalTo: {
        type: DataTypes.INTEGER,
      },
      approvalBy: {
        type: DataTypes.INTEGER,
      },
      approvalAt: {
        type: DataTypes.DATE,
      },
      approvalReason: {
        type: DataTypes.TEXT,
      },
      // 0 = pending
      // 1 = approved
      // -1 = rejected
      approvalStatus: {
        type: DataTypes.TINYINT,
      },
      requestCancellationTo: {
        type: DataTypes.INTEGER,
      },
      requestCancellationBy: {
        type: DataTypes.INTEGER,
      },
      requestCancellationAt: {
        type: DataTypes.DATE,
      },
      requestCancellationReason: {
        type: DataTypes.TEXT,
      },
      cancellationApprovalAt: {
        type: DataTypes.DATE,
      },
      cancellationApprovalBy: {
        type: DataTypes.INTEGER,
      },
      cancellationApprovalReason: {
        type: DataTypes.TEXT,
      },
      // 0 = pending
      // 1 = approved
      // -1 = rejected
      cancellationStatus: {
        type: DataTypes.TINYINT,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'Form',
      tableName: 'forms',
      underscored: true,
    }
  );
  return Form;
};
