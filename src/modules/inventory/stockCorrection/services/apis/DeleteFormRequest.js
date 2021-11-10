const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeleteFormRequest {
  constructor(tenantDatabase, { maker, stockCorrectionId, deleteFormRequestDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.stockCorrectionId = stockCorrectionId;
    this.deleteFormRequestDto = deleteFormRequestDto;
  }

  async call() {
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: { id: this.stockCorrectionId },
      include: [{ model: this.tenantDatabase.Form, as: 'form' }],
    });

    validate(stockCorrection, this.maker);

    const { form } = stockCorrection;
    await form.update({
      cancellationStatus: 0,
      requestCancellationBy: this.maker.id,
      requestCancellationTo: form.requestApprovalTo,
      requestCancellationReason: this.deleteFormRequestDto.reason,
      requestCancellationAt: new Date(),
    });

    return { stockCorrection };
  }
}

function validate(stockCorrection, maker) {
  if (!stockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction is not exist');
  }
  const { form } = stockCorrection;
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden - You are not the maker of the stock correction');
  }
  if (form.done === true) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Can not delete already referenced stock correction');
  }
}

module.exports = DeleteFormRequest;
