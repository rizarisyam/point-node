const { Form } = require('../../../../models').tenant;

module.exports = async function deleteFormApproveSalesInvoice(maker, formId, deleteFormApproveSalesInvoiceDto) {
  const form = await Form.findOne({ where: { id: formId } });
  form.update({
    cancellationStatus: 1,
    cancellationApprovalAt: new Date(),
    cancellationApprovalBy: deleteFormApproveSalesInvoiceDto.cancellationApprovalBy,
    cancellationApprovalReason: deleteFormApproveSalesInvoiceDto.cancellationApprovalReason,
  });
};
