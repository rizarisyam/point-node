const httpStatus = require('http-status');
let { SalesInvoice } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function createFormRejectSalesInvoice({
  currentTenantDatabase,
  approver,
  salesInvoiceId,
  createFormRejectSalesInvoiceDto,
}) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({ where: { id: salesInvoiceId } });
  const form = await salesInvoice.getForm();

  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (form.approvalStatus !== 0) {
    return { salesInvoice };
  }

  const { reason: approvalReason } = createFormRejectSalesInvoiceDto;

  const updatedForm = await form.update({
    approvalStatus: -1,
    approvalBy: approver.id,
    approvalAt: new Date(),
    approvalReason,
  });
  salesInvoice.dataValues.form = updatedForm;

  return { salesInvoice };
};

function setTenantDatabase(currentTenantDatabase) {
  ({ SalesInvoice } = currentTenantDatabase);
}
