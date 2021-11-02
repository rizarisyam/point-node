const fs = require('fs');
const path = require('path');
const htmlToPdf = require('html-pdf-node');
const moment = require('moment');
const logger = require('@src/config/logger');
const { Project } = require('@src/models').main;
const Mailer = require('@src/utils/Mailer');
const getCurrentTenantDatabase = require('@src/utils/getCurrentTenantDatabase');
const currencyFormat = require('@src/utils/currencyFormat');

class ProcessSendInvoiceToCustomer {
  constructor(tenantName, salesInvoiceId, sendInvoiceToCustomerDto) {
    this.tenantName = tenantName;
    this.salesInvoiceId = salesInvoiceId;
    this.sendInvoiceToCustomerDto = sendInvoiceToCustomerDto;
  }

  async call() {
    const tenantDatabase = await getCurrentTenantDatabase(this.tenantName);
    const { email, message } = this.sendInvoiceToCustomerDto;
    const salesInvoice = await tenantDatabase.SalesInvoice.findOne({ where: { id: this.salesInvoiceId } });
    const salesInvoiceForm = await salesInvoice.getForm();
    const maker = await salesInvoiceForm.getCreatedByUser();

    try {
      const emailBody = generateEmailBody({ maker, salesInvoice, message });
      const attachmentPdf = await generateAttachmentPdf(tenantDatabase, {
        salesInvoiceForm,
        salesInvoice,
      });

      const { messageId, to } = await new Mailer({
        to: email,
        subject: `Sales Invoice from ${maker.name} - ${salesInvoiceForm.number}`,
        html: emailBody,
        attachments: [{ filename: `Sales Invoice - ${salesInvoiceForm.number}.pdf`, content: attachmentPdf }],
      }).call();
      logger.info(`Sales invoice email sent, id: ${messageId}, email: ${to}, sales invoice: ${salesInvoiceForm.number}}`);
    } catch (error) {
      logger.error(error);
    }
  }
}

function generateEmailBody({ maker, salesInvoice, message }) {
  let emailBody = fs.readFileSync(path.resolve(__dirname, '../mails/salesInvoiceCustomerNotif.html'), 'utf8');
  emailBody = emailBody.replaceAll('{{customerName}}', salesInvoice.customerName);
  emailBody = emailBody.replaceAll('{{makerName}}', maker.name);

  if (!message) {
    emailBody = emailBody.replaceAll('{{message}}', '');
  } else {
    emailBody = emailBody.replaceAll(
      '{{message}}',
      `
        Message: <br>
        ${message}
      `
    );
  }

  return emailBody;
}

async function generateAttachmentPdf(tenantDatabase, { salesInvoiceForm, salesInvoice }) {
  let pdfBody = fs.readFileSync(path.resolve(__dirname, '../mails/salesInvoiceCustomerNotifAttachment.html'), 'utf8');
  let itemsHtml = '';

  const tenantName = tenantDatabase.sequelize.config.database.replace('point_', '');
  const project = await Project.findOne({ where: { code: tenantName } });
  const customer = await salesInvoice.getCustomer();
  const settingEndNote = await tenantDatabase.SettingEndNote.findOne();
  const settingLogo = await tenantDatabase.SettingLogo.findOne();

  const salesInvoiceItems = await salesInvoice.getItems();
  salesInvoiceItems.forEach((salesInvoiceItem, index) => {
    itemsHtml += `
    <tr>
      <td>${index + 1}</td>
      <td>${salesInvoiceItem.itemName}</td>
      <td>${currencyFormat(salesInvoiceItem.quantity)} ${salesInvoiceItem.unit}</td>
      <td>${currencyFormat(salesInvoiceItem.price)}</td>
      <td>${currencyFormat(salesInvoiceItem.discountValue)}</td>
      <td>${currencyFormat(salesInvoiceItem.getTotalPrice())}</td>
    </tr>
    `;
  });

  const { subTotal, taxBase, tax, amount } = await salesInvoice.getTotalDetails();
  pdfBody = pdfBody.replaceAll('{{logoUrl}}', settingLogo.publicUrl);
  pdfBody = pdfBody.replaceAll('{{companyName}}', project.name);
  pdfBody = pdfBody.replaceAll('{{companyAddress}}', project.address || '');
  pdfBody = pdfBody.replaceAll('{{companyPhone}}', project.phone || '');
  pdfBody = pdfBody.replaceAll('{{date}}', moment(salesInvoiceForm.date).format('DD MMMM YYYY'));
  pdfBody = pdfBody.replaceAll('{{invoiceNumber}}', salesInvoiceForm.number);
  pdfBody = pdfBody.replaceAll('{{customerName}}', customer.name);
  pdfBody = pdfBody.replaceAll('{{customerAddress}}', customer.address || '');
  pdfBody = pdfBody.replaceAll('{{customerPhone}}', customer.phone || '');
  pdfBody = pdfBody.replaceAll('{{items}}', itemsHtml);
  pdfBody = pdfBody.replaceAll('{{subTotal}}', currencyFormat(subTotal));
  pdfBody = pdfBody.replaceAll('{{discount}}', currencyFormat(salesInvoice.discountValue));
  pdfBody = pdfBody.replaceAll('{{taxBase}}', currencyFormat(taxBase));
  pdfBody = pdfBody.replaceAll('{{tax}}', currencyFormat(tax));
  pdfBody = pdfBody.replaceAll('{{total}}', currencyFormat(amount));
  pdfBody = pdfBody.replaceAll('{{notes}}', settingEndNote.salesInvoice);

  const options = { format: 'A4' };
  const pdfBuffer = await htmlToPdf.generatePdf({ content: pdfBody }, options);

  return pdfBuffer;
}

module.exports = ProcessSendInvoiceToCustomer;
