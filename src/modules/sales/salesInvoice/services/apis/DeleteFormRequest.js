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
    const salesInvoice = await this.tenantDatabaseSalesInvoice.findOne({
      where: { id: this.salesInvoiceIdsalesInvoiceId },
      include: [{ model: this.tenantDatabase.Form, as: 'form' }],
    });
    const { form } = salesInvoice;

    validate(form, this.maker);

    form.update({
      cancellationStatus: 0,
      requestCancellationBy: this.maker.id,
      requestCancellationTo: form.requestApprovalTo,
      requestCancellationReason: this.deleteFormRequestDto.reason,
      requestCancellationAt: new Date(),
    });

    return { salesInvoice };
  }
}

function validate(form, maker) {
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (form.done === true) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

module.exports = DeleteFormRequest;
