const Mailer = require('@src/modules/mailer/index.mailer');
const Worker = require('./index.worker');

class SendEmailWorker {
  constructor({ jobTitle, to, subject, html }) {
    this.jobTitle = jobTitle;
    this.to = to;
    this.subject = subject;
    this.html = html;
  }

  call() {
    const job = () => {
      new Mailer({ to: this.to, subject: this.subject, html: this.html }).call();
    };

    new Worker({ title: this.jobTitle, job }).call();
  }
}

module.exports = SendEmailWorker;
