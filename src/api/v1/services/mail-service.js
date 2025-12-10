const nodemailer = require('nodemailer');
const utils = require('../utils/utils');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const ApiError = require('../exceptions/api-error');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendActivationMail(to, code) {
    try {
      const activationTemplate = await utils.prepareMailTemplate('activation', {
        code
      });

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: technicalMessagesUtils.mailMessages.ACTIVATION_MAIL_SUBJECT,
        html: activationTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        technicalMessagesUtils.mailMessages.ERROR_SENDING_EMAIL
      );
    }
  }

  async sendResetMail(to, code) {
    try {
      const resetTemplate = await utils.prepareMailTemplate('reset', { code });

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: technicalMessagesUtils.mailMessages.RESET_MAIL_SUBJECT,
        html: resetTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        technicalMessagesUtils.mailMessages.ERROR_SENDING_EMAIL
      );
    }
  }

  async sendNewPasswordMail(to, password) {
    try {
      const newPasswordTemplate = await utils.prepareMailTemplate(
        'new-password',
        { password }
      );

      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: technicalMessagesUtils.mailMessages.NEW_PASSWORD_SUBJECT,
        html: newPasswordTemplate
      });
    } catch (err) {
      throw ApiError.badRequest(
        technicalMessagesUtils.mailMessages.ERROR_SENDING_EMAIL
      );
    }
  }
}

module.exports = new MailService();
