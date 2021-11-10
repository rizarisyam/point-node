const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeleteFormReject {
  constructor(tenantDatabase, { approver, stockCorrectionId, deleteFormRejectDto }) {
    this.tenantDatabase = tenantDatabase;
    this.approver = approver;
    this.stockCorrectionId = stockCorrectionId;
    this.deleteFormRejectDto = deleteFormRejectDto;
  }

  async call() {
    const stockCorrection = await this.tenantDatabase.StockCorrection.findOne({
      where: { id: this.stockCorrectionId },
      include: [{ model: this.tenantDatabase.Form, as: 'form' }],
    });

    validate(stockCorrection, this.approver);

    const { form } = stockCorrection;
    await form.update({
      cancellationStatus: -1,
      cancellationApprovalAt: new Date(),
      cancellationApprovalBy: this.approver.id,
      cancellationApprovalReason: this.deleteFormRejectDto.reason,
    });

    return { stockCorrection };
  }
}

function validate(stockCorrection, approver) {
  if (!stockCorrection) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Stock correction is not exist');
  }
  const { form } = stockCorrection;
  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden - You are not selected approver');
  }
  if (form.cancellationStatus !== 0) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Stock correction is not requested to be delete');
  }
}

module.exports = DeleteFormReject;
