const Worker = require('@src/utils/Worker');
const ProcessSendApproval = require('../services/ProcessSendApproval');

class ProcessSendApprovalWorker {
  constructor({ tenantName, salesInvoiceId, options = {} }) {
    this.tenantName = tenantName;
    this.salesInvoiceId = salesInvoiceId;
    this.options = options;
  }

  call() {
    const job = () => {
      new ProcessSendApproval(this.tenantName, this.salesInvoiceId).call();
    };

    new Worker({
      title: `send sales invoice approval email - ${this.salesInvoiceId}`,
      job,
      options: this.options,
    }).call();
  }
}

module.exports = ProcessSendApprovalWorker;
