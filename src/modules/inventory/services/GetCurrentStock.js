const moment = require('moment');
const { Op, Sequelize } = require('sequelize');

class GetCurrentStock {
  constructor(tenantDatabase, { item, date, warehouseId, options = { expiryDate: null, productionNumber: null } }) {
    this.tenantDatabase = tenantDatabase;
    this.item = item;
    this.date = date;
    this.warehouseId = warehouseId;
    this.options = options;
  }

  async call() {
    const inventories = await this.tenantDatabase.Inventory.findAll({
      group: ['itemId', 'productionNumber', 'expiryDate'],
      where: generateFilter({ item: this.item, warehouseId: this.warehouseId, date: this.date, options: this.options }),
      include: [{ model: this.tenantDatabase.Form, as: 'form', attributes: [] }],
      attributes: [
        'itemId',
        'productionNumber',
        'expiryDate',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'remaining'],
      ],
    });

    if (!inventories[0]) {
      return 0;
    }

    return parseFloat(inventories[0].dataValues.remaining);
  }
}

function generateFilter({ item, warehouseId, date, options }) {
  const onlyDateFormDateFormat = moment(date).format('YYYY-MM-DD');
  const filter = {
    itemId: item.id,
    warehouseId,
    '$form.date$': { [Op.lte]: onlyDateFormDateFormat },
    // '$form.date$': Sequelize.where(Sequelize.fn('date', Sequelize.col('date')), '<=', onlyDateFormDateFormat),
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
