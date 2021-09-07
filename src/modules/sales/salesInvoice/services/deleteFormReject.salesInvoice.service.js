const { Form } = require('@src/models').tenant;

module.exports = async function deleteFormRejectSalesFormInvoice(approver, formId, deleteFormRejectSalesInvoiceDto) {
  const form = await Form.findOne({ where: { id: formId } });
  form.update({
    cancellationStatus: -1,
    cancellationApprovalReason: deleteFormRejectSalesInvoiceDto.cancellationApprovalReason,
    cancellationApprovalAt: new Date(),
  });
};
