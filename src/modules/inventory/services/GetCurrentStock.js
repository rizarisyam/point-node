const { Op } = require('sequelize');

class GetCurrentStock {
  constructor(tenantDatabase, { item, date, warehouseId, useDna = true, options }) {
    this.tenantDatabase = tenantDatabase;
    this.item = item;
    this.date = date;
    this.warehouseId = warehouseId;
    this.useDna = useDna;
    this.options = {
      ...(options.expiryDate ? { expiryDate: options.expiryDate } : {}),
      ...(options.productionNumber ? { productionNumber: options.productionNumber } : {}),
    };
  }

  async call() {
    const { sequelize } = this.tenantDatabase;
    const inventories = await this.tenantDatabase.Inventory.findAll({
      group: ['itemId', ...(this.useDna ? ['productionNumber', 'expiryDate'] : [])],
      where: generateFilter(this.tenantDatabase, {
        item: this.item,
        warehouseId: this.warehouseId,
        date: this.date,
        useDna: this.useDna,
        options: this.options,
      }),
      include: [{ model: this.tenantDatabase.Form, as: 'form', attributes: [] }],
      attributes: [
        'itemId',
        ...(this.useDna && this.options.productionNumber ? ['productionNumber'] : []),
        ...(this.useDna && this.options.expiryDate ? ['expiryDate'] : []),
        [sequelize.fn('SUM', sequelize.col('quantity')), 'remaining'],
      ],
    });

    if (!inventories[0]) {
      return 0;
    }

    return parseFloat(inventories[0].dataValues.remaining);
  }
}

function generateFilter(tenantDatabase, { item, warehouseId, date, useDna, options }) {
  const { sequelize } = tenantDatabase;
  const filter = {
    itemId: item.id,
    warehouseId,
    [Op.and]: [sequelize.where(sequelize.fn('date', sequelize.col('form.date')), '<', date)],
  };
  if (useDna && item.requireExpiryDate && options.expiryDate) {
    filter.expiryDate = options.expiryDate;
  }
  if (useDna && item.requireProductionNumber && options.expiryDate) {
    filter.productionNumber = options.productionNumber;
  }

  return filter;
}

module.exports = GetCurrentStock;
