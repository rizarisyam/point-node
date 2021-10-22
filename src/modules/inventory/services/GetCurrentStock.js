const { Op, Sequelize } = require('sequelize');

class GetCurrentStock {
  constructor(tenantDatabase, { item, date, warehouse, options = { expiryDate: null, productionNumber: null } }) {
    this.tenantDatabase = tenantDatabase;
    this.item = item;
    this.date = date;
    this.warehouse = warehouse;
    this.options = options;
  }

  async call() {
    const inventories = await this.tenantDatabase.Inventory.findAll({
      group: ['itemId', 'productionNumber', 'expiryDate'],
      where: generateFilter({ item: this.item, warehouse: this.warehouse, date: this.date, options: this.options }),
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

    return inventories[0].remaining;
  }
}

function generateFilter({ item, warehouse, date, options }) {
  const filter = {
    itemId: item.id,
    warehouseId: warehouse.id,
    '$form.date$': { [Op.lt]: date },
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
