const fs = require('fs');
const path = require('path');
const moment = require('moment');
const logger = require('@src/config/logger');
const config = require('@src/config/config');
const tokenService = require('@src/modules/auth/services/token.service');
const Mailer = require('@src/utils/Mailer');
const getCurrentTenantDatabase = require('@src/utils/getCurrentTenantDatabase');
const ProcessSendApprovalWorker = require('../workers/ProcessSendApproval.worker');

class ProcessSendApproval {
  constructor(tenantName, salesInvoiceId) {
    this.tenantName = tenantName;
    this.salesInvoiceId = salesInvoiceId;
  }

  async call() {
    const tenantDatabase = await getCurrentTenantDatabase(this.tenantName);
    const salesInvoice = await tenantDatabase.SalesInvoice.findOne({ where: { id: this.salesInvoiceId } });
    const salesInvoiceForm = await salesInvoice.getForm();
    if (salesInvoiceForm.approvalStatus !== 0) {
      return;
    }
    const maker = await salesInvoiceForm.getCreatedByUser();
    const approver = await salesInvoiceForm.getRequestApprovalToUser();
    const reference = await salesInvoice.getReferenceable();
    const formReference = await reference.getForm();

    try {
      const emailBody = await generateApprovalEmailBody({
        tenantName: this.tenantName,
        maker,
        approver,
        salesInvoiceForm,
        formReference,
        salesInvoice,
      });
      const { messageId, to } = await new Mailer({
        jobTitle: 'Send Approval Email',
        to: approver.email,
        subject: `Approval Email - Sales Invoice ${salesInvoiceForm.number}`,
        html: emailBody,
      }).call();

      logger.info(
        `Sales invoice approval email sent, id: ${messageId}, email: ${to}, sales invoice: ${salesInvoiceForm.number}}`
      );

      new ProcessSendApprovalWorker({
        tenantName: this.tenantName,
        salesInvoiceId: this.salesInvoiceId,
        // options: { delay: 1000 * 60 * 60 * 24 * 1 }, // 1 day
        options: { delay: 1000 * 60 * 1 }, // 1 minute
      }).call();
    } catch (error) {
      logger.error(error);
    }
  }
}

async function generateApprovalEmailBody({ tenantName, maker, approver, salesInvoiceForm, formReference, salesInvoice }) {
  let emailBody = fs.readFileSync(path.resolve(__dirname, '../mails/salesInvoiceApproval.html'), 'utf8');
  let itemsHtml = '';

  const salesInvoiceItems = await salesInvoice.getItems();
  salesInvoiceItems.forEach((salesInvoiceItem, index) => {
    itemsHtml += `
    <tr>
      <td>${index + 1}</td>
      <td>${salesInvoiceItem.itemName}</td>
      <td>${salesInvoiceItem?.allocation?.name || ''}</td>
      <td>${parseFloat(salesInvoiceItem.quantity)} ${salesInvoiceItem.unit}</td>
      <td>${parseFloat(salesInvoiceItem.price)}</td>
      <td>${salesInvoiceItem.getDiscountString()}</td>
      <td>${salesInvoiceItem.getTotalPrice()}</td>
    </tr>
    `;
  });

  const { subTotal, taxBase, tax, amount } = await salesInvoice.getTotalDetails();

  const emailApprovalToken = await generateEmailApprovalToken(salesInvoice, approver);
  const tenantWebsite = config.websiteUrl.replace('http://', `http:://${tenantName}.`);

  emailBody = emailBody.replaceAll('{{approverName}}', approver.name);
  emailBody = emailBody.replaceAll('{{formNumber}}', salesInvoiceForm.number);
  emailBody = emailBody.replaceAll('{{formDate}}', moment(salesInvoiceForm.date).format('DD MMMM YYYY'));
  emailBody = emailBody.replaceAll('{{formReference}}', formReference.number);
  emailBody = emailBody.replaceAll('{{customerName}}', salesInvoice.customerName);
  emailBody = emailBody.replaceAll('{{createdAt}}', moment(salesInvoiceForm.createdAt).format('DD MMMM YYYY'));
  emailBody = emailBody.replaceAll('{{createdBy}}', maker.name);
  emailBody = emailBody.replaceAll('{{notes}}', salesInvoiceForm.notes || '');
  emailBody = emailBody.replaceAll('{{items}}', itemsHtml);
  emailBody = emailBody.replaceAll('{{subTotal}}', subTotal);
  emailBody = emailBody.replaceAll('{{discount}}', salesInvoice.getDiscountString());
  emailBody = emailBody.replaceAll('{{taxBase}}', taxBase);
  emailBody = emailBody.replaceAll('{{tax}}', tax);
  emailBody = emailBody.replaceAll('{{total}}', amount);
  emailBody = emailBody.replaceAll('{{checkLink}}', `${tenantWebsite}/sales/invoice/${salesInvoice.id}`);
  emailBody = emailBody.replaceAll(
    '{{approveLink}}',
    `${config.websiteUrl}/approval?tenant=${tenantName}&action=approve&token=${emailApprovalToken}`
  );
  emailBody = emailBody.replaceAll(
    '{{rejectLink}}',
    `${config.websiteUrl}/approval?tenant=${tenantName}&action=reject&token=${emailApprovalToken}`
  );

  return emailBody;
}

async function generateEmailApprovalToken(salesInvoice, approver) {
  const payload = {
    salesInvoiceId: salesInvoice.id,
    userId: approver.id,
  };
  const expires = moment().add(7, 'days');

  const token = await tokenService.generatePayloadToken(payload, expires);

  return token;
}

module.exports = ProcessSendApproval;
