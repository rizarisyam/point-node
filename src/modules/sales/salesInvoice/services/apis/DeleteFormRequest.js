const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeleteFormRequest {
  constructor(tenantDatabase, { maker, salesInvoiceId, deleteFormRequestDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.salesInvoiceId = salesInvoiceId;
    this.deleteFormRequestDto = deleteFormRequestDto;
  }

  async call() {
    const salesInvoice = await this.tenantDatabase.SalesInvoice.findOne({
      where: { id: this.salesInvoiceId },
      include: [{ model: this.tenantDatabase.Form, as: 'form' }],
    });

    validate(salesInvoice, this.maker);

    const { form } = salesInvoice;
    await form.update({
      cancellationStatus: 0,
      requestCancellationBy: this.maker.id,
      requestCancellationTo: form.requestApprovalTo,
      requestCancellationReason: this.deleteFormRequestDto.reason,
      requestCancellationAt: new Date(),
    });

    return { salesInvoice };
  }
}

function validate(salesInvoice, maker) {
  if (!salesInvoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Sales invoice is not exist');
  }
  const { form } = salesInvoice;
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (form.done === true) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Can not delete already referenced sales invoice');
  }
}

module.exports = DeleteFormRequest;
