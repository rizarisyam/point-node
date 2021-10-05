const httpStatus = require('http-status');
let { Form, SalesInvoice } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function deleteFormRequestSalesInvoice({
  currentTenantDatabase,
  maker,
  salesInvoiceId,
  deleteFormRequestSalesInvoiceDto,
}) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({
    where: { id: salesInvoiceId },
    include: [{ model: Form, as: 'form' }],
  });
  const { form } = salesInvoice;

  validate(form, maker);

  form.update({
    cancellationStatus: 0,
    requestCancellationBy: maker.id,
    requestCancellationTo: form.requestApprovalTo,
    requestCancellationReason: deleteFormRequestSalesInvoiceDto.reason,
    requestCancellationAt: new Date(),
  });

  return { salesInvoice };
};

function validate(form, maker) {
  if (form.createdBy !== maker.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (form.done === true) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

function setTenantDatabase(currentTenantDatabase) {
  ({ Form, SalesInvoice } = currentTenantDatabase);
}
