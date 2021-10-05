const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('@src/config/config');
const SendEmailWorker = require('@src/modules/workers/sendEmail.worker');
const tokenService = require('@src/modules/auth/services/token.service');

module.exports = async function sendApprovalEmail({
  currentTenantDatabase,
  maker,
  salesInvoiceForm,
  formReference,
  salesInvoice,
  createSalesInvoiceDto,
}) {
  const approver = await salesInvoiceForm.getRequestApprovalToUser();
  try {
    const emailBody = await generateApprovalEmailBody({
      currentTenantDatabase,
      maker,
      approver,
      salesInvoiceForm,
      formReference,
      salesInvoice,
      createSalesInvoiceDto,
    });
    const { messageId, to } = await new SendEmailWorker({
      jobTitle: 'Send Approval Email',
      to: approver.email,
      subject: `Approval Email - Sales Invoice ${salesInvoiceForm.number}`,
      html: emailBody,
    }).call();

    // eslint-disable-next-line no-console
    console.log(
      `Sales invoice approval email sent, id: ${messageId}, email: ${to}, sales invoice: ${salesInvoiceForm.number}}`
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
};

async function generateApprovalEmailBody({
  currentTenantDatabase,
  maker,
  approver,
  salesInvoiceForm,
  formReference,
  salesInvoice,
  createSalesInvoiceDto,
}) {
  const { typeOfTax, items, discountPercent, discountValue } = createSalesInvoiceDto;
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

  const subTotal = getSubTotal(items);
  const taxBase = getTaxBase(subTotal, discountValue, discountPercent);
  const tax = getTax(taxBase, typeOfTax);
  const amount = getAmount(taxBase, tax, typeOfTax);

  const emailApprovalToken = await generateEmailApprovalToken(salesInvoice, approver);
  const tenantName = currentTenantDatabase.sequelize.config.database.replace('point_', '');
  const tenantWebsite = config.websiteUrl.replace('http://', `http:://${tenantName}.`);

  emailBody = emailBody.replaceAll('{{approverName}}', approver.name);
  emailBody = emailBody.replaceAll('{{formNumber}}', salesInvoiceForm.number);
  emailBody = emailBody.replaceAll('{{formDate}}', salesInvoiceForm.date);
  emailBody = emailBody.replaceAll('{{formReference}}', formReference.number);
  emailBody = emailBody.replaceAll('{{customerName}}', salesInvoice.customerName);
  emailBody = emailBody.replaceAll('{{createdAt}}', salesInvoiceForm.createdAt);
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

function getSubTotal(items) {
  const subTotal = items.reduce((result, item) => {
    return result + getItemsPrice(item);
  }, 0);

  return subTotal;
}

function getItemsPrice(item) {
  let perItemPrice = item.price;
  if (item.discountValue > 0) {
    perItemPrice -= item.discountValue;
  }
  if (item.discountPercent > 0) {
    const discountPercent = item.discountPercent / 100;
    perItemPrice -= perItemPrice * discountPercent;
  }
  const totalItemPrice = perItemPrice * item.quantity;

  return totalItemPrice;
}

function getTaxBase(subTotal, discountValue, discountPercent) {
  if (discountValue > 0) {
    return subTotal - discountValue;
  }

  if (discountPercent > 0) {
    return subTotal - subTotal * (discountPercent / 100);
  }

  return subTotal;
}

function getTax(taxBase, typeOfTax) {
  if (typeOfTax === 'include') {
    return (taxBase * 10) / 110;
  }

  if (typeOfTax === 'exclude') {
    return taxBase * 0.1;
  }

  return 0;
}

function getAmount(taxBase, tax, typeOfTax) {
  if (typeOfTax === 'exclude') {
    return taxBase + tax;
  }

  return taxBase;
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
