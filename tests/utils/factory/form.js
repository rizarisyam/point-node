const { Form } = require('@src/models').tenant;

async function create({
  branch,
  incrementNumber = 1,
  incrementGroup = 202109,
  reference,
  createdBy,
  updatedBy,
  requestApprovalTo,
}) {
  const form = await Form.create({
    branchId: branch.id,
    date: new Date('2021-01-01'),
    number: 'DN2109001',
    incrementNumber,
    incrementGroup,
    formableId: reference.id,
    formableType: 'SalesDeliveryNote',
    createdBy,
    updatedBy,
    requestApprovalTo,
  });

  return form;
}

module.exports = { create };
