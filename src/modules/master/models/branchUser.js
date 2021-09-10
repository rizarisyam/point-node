const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BranchUser extends Model {
    static associate({ tenant: models }) {
      this.belongsTo(models.User, { onDelete: 'CASCADE' });
      this.belongsTo(models.Branch, { onDelete: 'CASCADE' });
    }
  }
  BranchUser.init(
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      branchId: {
        type: DataTypes.INTEGER,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'BranchUser',
      tableName: 'branch_users',
      underscored: true,
    }
  );
};
