class CreateFormApprove {}

// async function addStockCorrectionItem(
//   tenantDatabase,
//   { stockCorrection, stockCorrectionForm, warehouse, createFormRequestDto, transaction }
// ) {
//   const { items: itemsRequest } = createFormRequestDto;
//   await itemsRequest.maps(async (itemRequest) => {
//     const item = await tenantDatabase.Item.findOne({ where: { id: itemRequest.id } });
//     const itemUnit = await tenantDatabase.ItemUnit.findOne({ where: { id: itemRequest.itemUnitId, itemId: item.id } });
//     if (itemUnit.converter !== 1) {
//       throw new ApiError(httpStatus.BAD_REQUEST, 'Only can use smallest item unit');
//     }
//     await new InsertInventoryRecord(tenantDatabase, {
//       form: stockCorrectionForm.id,
//       warehouse,
//       item,
//       quantity: itemRequest.stockCorrection,
//       unit: itemUnit.label,
//       converter: itemUnit.converter,
//       options: {
//         expiryDate: itemRequest.expiryDate,
//         productionNumber: itemRequest.productionNumber,
//       },
//       transaction,
//     }).call();

//     return tenantDatabase.StockCorrectionItem.create({
//       stockCorrectionId: stockCorrection.id,
//       itemId: item.id,
//       quantity: itemRequest.stockCorrection,
//       unit: itemUnit.label,
//       converter: itemUnit.converter,
//       notes: itemRequest.notes,
//       ...(itemRequest.expiryDate && { expiryDate: itemRequest.expiryDate }),
//       ...(itemRequest.productionNumber && { productionNumber: itemRequest.productionNumber }),
//     });
//   });
// }

module.exports = CreateFormApprove;
