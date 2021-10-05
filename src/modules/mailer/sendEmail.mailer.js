/* eslint-disable no-console */
const Mailer = require('./index.mailer');

class SendEmail {
  constructor({ to, subject, html }) {
    this.to = to;
    this.subject = subject;
    this.html = html;
  }

  call() {
    return new Mailer({
      to: this.to,
      subject: this.subject,
      html: this.html,
    }).call();
  }
}

module.exports = SendEmail;
