const { Op } = require('sequelize');
const moment = require('moment');

class GetCurrentStock {
  constructor(tenantDatabase, { item, date, warehouseId, options = { expiryDate: null, productionNumber: null } }) {
    this.tenantDatabase = tenantDatabase;
    this.item = item;
    this.date = date;
    this.warehouseId = warehouseId;
    this.options = options;
  }

  async call() {
    const { sequelize } = this.tenantDatabase;
    const inventories = await this.tenantDatabase.Inventory.findAll({
      group: ['itemId', 'productionNumber', 'expiryDate'],
      where: generateFilter(this.tenantDatabase, {
        item: this.item,
        warehouseId: this.warehouseId,
        date: this.date,
        options: this.options,
      }),
      include: [{ model: this.tenantDatabase.Form, as: 'form', attributes: [] }],
      attributes: [
        'itemId',
        'productionNumber',
        'expiryDate',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'remaining'],
      ],
    });

    if (!inventories[0]) {
      return 0;
    }

    return parseFloat(inventories[0].dataValues.remaining);
  }
}

function generateFilter(tenantDatabase, { item, warehouseId, date, options }) {
  const { sequelize } = tenantDatabase;
  const onlyDateFormDateFormat = moment(date).format('YYYY-MM-DD');
  const filter = {
    itemId: item.id,
    warehouseId,
    [Op.and]: [
      sequelize.where(sequelize.fn('date', sequelize.col('form.date')), '<', onlyDateFormDateFormat),
      sequelize.where(sequelize.fn('SUM', sequelize.col('quantity')), '>', 0),
    ],
  };
  if (item.requireExpiryDate) {
    filter.expiryDate = options.expiryDate;
  }
  if (item.requireProductionNumber) {
    filter.productionNumber = options.productionNumber;
  }

  return filter;
}

module.exports = GetCurrentStock;
