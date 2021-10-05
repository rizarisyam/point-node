const httpStatus = require('http-status');
let { Form, SalesInvoice, Journal } = require('@src/models').tenant;
const ApiError = require('@src/utils/ApiError');

module.exports = async function deleteFormApproveSalesInvoice({ currentTenantDatabase, approver, salesInvoiceId }) {
  setTenantDatabase(currentTenantDatabase);
  const salesInvoice = await SalesInvoice.findOne({
    where: { id: salesInvoiceId },
    include: [{ model: Form, as: 'form' }],
  });
  const { form } = salesInvoice;

  validate(form, approver);
  await deleteJournal(form);
  updateForm(form, approver);

  return { salesInvoice };
};

function validate(form, approver) {
  if (form.requestApprovalTo !== approver.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

async function deleteJournal(form) {
  await Journal.destroy({ where: { formId: form.id } });
}

function updateForm(form, approver) {
  form.update({
    cancellationStatus: 1,
    cancellationApprovalAt: new Date(),
    cancellationApprovalBy: approver.id,
  });
}

function setTenantDatabase(currentTenantDatabase) {
  ({ Form, SalesInvoice, Journal } = currentTenantDatabase);
}
