const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const GetCurrentStock = require('@src/modules/inventory/services/GetCurrentStock');
const InsertInventoryRecord = require('@src/modules/inventory/services/InsertInventoryRecord');

class CreateFormRequest {
  constructor(tenantDatabase, { maker, createFormRequestDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.createFormRequestDto = createFormRequestDto;
  }

  async call() {
    const currentDate = new Date(Date.now());
    const { warehouseId } = this.createFormRequestDto;
    const warehouse = await this.tenantDatabase.Warehouse.findOne({
      where: { id: warehouseId },
    });
    await validate(this.tenantDatabase, { warehouse, maker: this.maker });

    let stockCorrection, stockCorrectionForm;
    await this.tenantDatabase.sequelize.transaction(async (transaction) => {
      stockCorrection = await createStockCorrection(this.tenantDatabase, {
        maker: this.maker,
        createFormRequestDto: this.createFormRequestDto,
        transaction,
      });
      stockCorrectionForm = await createStockCorrectionForm(this.tenantDatabase, {
        maker: this.maker,
        stockCorrection,
        createFormRequestDto: this.createFormRequestDto,
        currentDate,
        transaction,
      });
      await addStockCorrectionItem(tenantDatabase, {
        stockCorrection,
        stockCorrectionForm,
        createFormRequestDto,
        transaction,
      });
    });
  }
}

async function validate(tenantDatabase, { warehouse, maker }) {
  await validateBranchDefaultPermission(tenantDatabase, { makerId: maker.id, branchId: warehouse.branchId });
  await validateWarehouseDefaultPermission(tenantDatabase, { makerId: maker.id, warehouseId: warehouse.id });
}

async function validateBranchDefaultPermission(tenantDatabase, { makerId, branchId }) {
  const branchUser = await tenantDatabase.BranchUser.findOne({
    where: {
      userId: makerId,
      branchId,
      isDefault: true,
    },
  });
  if (!branchUser) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function validateWarehouseDefaultPermission(tenantDatabase, { makerId, warehouseId }) {
  const userWarehouse = await tenantDatabase.UserWarehouse.findOne({
    where: {
      userId: makerId,
      warehouseId,
      isDefault: true,
    },
  });
  if (!userWarehouse) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function createStockCorrection(tenantDatabase, { createFormRequestDto, transaction }) {
  const stockCorrection = await this.tenantDatabase.StockCorrection.create(
    {
      warehouseId: createFormRequestDto.warehouseId,
    },
    { transaction }
  );

  return { stockCorrection };
}

async function addStockCorrectionItem(
  tenantDatabase,
  { stockCorrection, stockCorrectionForm, warehouse, createFormRequestDto, transaction }
) {
  const { items: itemsRequest, dueDate } = createFormRequestDto;
  await itemsRequest.maps(async (itemRequest) => {
    const item = await tenantDatabase.Item.findOne({ where: { id: itemRequest.id } });
    const { inventory } = await new InsertInventoryRecord(tenantDatabase, {
      form: stockCorrectionForm.id,
      warehouse,
      item,
      quantity,
      unit,
      converter,
      options,
      transaction,
    });

    return tenantDatabase.StockCorrection.create({
      stockCorrectionId: stockCorrection.id,
      itemId: item.id,
      quantity: itemRequest.stockCorrection,
      unit: item.unitDefault,
    });
  });
}

module.exports = CreateFormRequest;
