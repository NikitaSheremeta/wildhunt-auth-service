const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const ACTIVATION_CODE_MIN = 1000;
const ACTIVATION_CODE_MAX = 9999;

class Utils {
  generatePassword() {
    const symbols =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№;%:?*()_+=';
    const passwordLength = 24;

    let password = '';

    for (let i = 0; i < passwordLength; i++) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }

    return password;
  }

  generateActivationCode() {
    return String(
      Math.floor(
        ACTIVATION_CODE_MIN +
          Math.random() * (ACTIVATION_CODE_MAX - ACTIVATION_CODE_MIN + 1)
      )
    );
  }

  async prepareMailTemplate(templateName, templateData) {
    const filepath = path.join(
      __dirname,
      '..',
      'templates',
      `${templateName}-mail-template.html`
    );

    return new Promise((resolve, reject) => {
      fs.readFile(filepath, 'utf-8', (error, content) => {
        if (error) {
          reject(error);
        }

        const handlebarsTemplate = Handlebars.compile(content);
        const template = handlebarsTemplate({ ...templateData });

        resolve(template);
      });
    });
  }
}

module.exports = new Utils();
