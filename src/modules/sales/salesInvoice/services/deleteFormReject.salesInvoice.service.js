const httpStatus = require('http-status');
let { Form, SalesInvoice } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function deleteFormRejectSalesFormInvoice({
  currentTenantDatabase,
  approver,
  salesInvoiceId,
  deleteFormRejectSalesInvoiceDto,
}) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({
    where: { id: salesInvoiceId },
    include: [{ model: Form, as: 'form' }],
  });
  const { form } = salesInvoice;

  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  form.update({
    cancellationStatus: -1,
    cancellationApprovalAt: new Date(),
    cancellationApprovalBy: approver.id,
    cancellationApprovalReason: deleteFormRejectSalesInvoiceDto.reason,
  });

  return { salesInvoice };
};

function setTenantDatabase(currentTenantDatabase) {
  ({ Form, SalesInvoice } = currentTenantDatabase);
}
