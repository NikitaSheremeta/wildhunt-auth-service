const codeData = require('../data/code-data');
const dateUtils = require('../utils/date-utils');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const ApiError = require('../exceptions/api-error');
const utils = require('../utils/utils');

// eslint-disable-next-line no-magic-numbers
const FIFTEEN_MINUTES_IN_SECONDS = 900;

class CodeService {
  generateResetCode() {
    return utils.generateActivationCode();
  }

  async validateResetCode(code) {
    const resetCodeData = await codeData.getResetCodeByCode(code);

    if (!resetCodeData) {
      return null;
    }

    return {
      id: resetCodeData.user_id
    };
  }

  async saveResetCode(userId, resetCode) {
    const resetCodeData = await codeData.getResetCodeByUserId(userId);

    if (resetCodeData) {
      if (resetCodeData.created_at) {
        const lastRequestDate = dateUtils.convertIsoToMilliseconds(
          resetCodeData.created_at
        );

        const isDifference = dateUtils.getDifferenceInTime(
          lastRequestDate,
          FIFTEEN_MINUTES_IN_SECONDS
        );

        if (isDifference) {
          throw ApiError.badRequest(
            technicalMessagesUtils.codeMessages.TRY_AGAIN_LATER
          );
        }
      }

      return await codeData.updateResetCode(userId, resetCode);
    }

    await codeData.createResetCode(userId, resetCode);
  }

  async generateAndSaveResetCode(userData) {
    const resetCode = this.generateResetCode();

    await this.saveResetCode(userData.id, resetCode);

    return resetCode;
  }

  async deleteResetCode(resetCode) {
    await codeData.deleteResetCode(resetCode);
  }
}

module.exports = new CodeService();
