const Worker = require('@src/utils/Worker');
const ProcessSendApproval = require('../services/ProcessSendApproval');

class ProcessSendApprovalWorker {
  constructor({ tenantName, stockCorrectionId, options = {} }) {
    this.tenantName = tenantName;
    this.stockCorrectionId = stockCorrectionId;
    this.options = options;
  }

  call() {
    const job = () => {
      new ProcessSendApproval(this.tenantName, this.stockCorrectionId).call();
    };

    new Worker({
      title: `send stock correction approval email - ${this.stockCorrectionId}`,
      job,
      options: this.options,
    }).call();
  }
}

module.exports = ProcessSendApprovalWorker;
