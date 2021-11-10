class FindOne {
  constructor(tenantDatabase, stockCorrectionId) {
    this.tenantDatabase = tenantDatabase;
    this.stockCorrectionId = stockCorrectionId;
  }

  async call() {
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: {
        id: this.stockCorrectionId,
      },
      include: [
        {
          model: this.tenantDatabase.StockCorrectionItem,
          as: 'items',
        },
        {
          model: this.tenantDatabase.Form,
          as: 'form',
          include: [
            { model: this.tenantDatabase.User, as: 'requestApprovalToUser' },
            { model: this.tenantDatabase.User, as: 'createdByUser' },
          ],
        },
        { model: this.tenantDatabase.Customer, as: 'customer' },
      ],
    });

    return { stockCorrection };
  }
}

module.exports = FindOne;
