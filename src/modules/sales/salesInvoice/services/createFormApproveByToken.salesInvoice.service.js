const httpStatus = require('http-status');
const { JsonWebTokenError } = require('jsonwebtoken');
let { User } = require('@src/models').tenant;
const tokenService = require('@src/modules/auth/services/token.service');
const ApiError = require('@src/utils/ApiError');
const createFormApproveSalesInvoiceService = require('./createFormApprove.salesInvoice.service');

module.exports = async function createFormApproveSalesInvoice({ currentTenantDatabase, token }) {
  try {
    setTenantDatabase(currentTenantDatabase);
    const payload = await tokenService.verifyToken(token);
    if (!payload) {
      throw new ApiError(httpStatus.FORBIDDEN, 'FORBIDDEN');
    }

    const { salesInvoiceId, userId } = payload;
    const approver = await User.findOne({ where: { id: userId } });
    const { salesInvoice } = await createFormApproveSalesInvoiceService({ currentTenantDatabase, approver, salesInvoiceId });

    const form = await salesInvoice.getForm();
    salesInvoice.dataValues.form = form;

    return { salesInvoice };
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'invalid token');
    }

    throw e;
  }
};

function setTenantDatabase(currentTenantDatabase) {
  ({ User } = currentTenantDatabase);
}
