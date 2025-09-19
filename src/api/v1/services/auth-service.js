const userData = require('../data/user-data');
const ApiError = require('../exceptions/api-error');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const uuid = require('uuid');
const mailService = require('./mail-service');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');
const tokenData = require('../data/token-data');
const utils = require('../utils/utils');

const SALT = 10;

class AuthService {
  async userRegistration(userInputData) {
    const userName = await userData.getUserByName(userInputData.userName);
    const userEmail = await userData.getUserByEmail(userInputData.email);

    if (userName) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.NICKNAME_IS_ALREADY_REGISTERED
      );
    }

    if (userEmail) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.EMAIL_IS_ALREADY_REGISTERED
      );
    }

    const activationLink = uuid.v4();

    // I guess if the mail obviously doesn't exist,
    // there is no need to create a user.
    // That is why sending a letter before creating a user to the database.
    // await mailService.sendActivationMail(
    //   userInputData.email,
    //   `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    // );

    console.log('activationLink', `/api/v1/auth/activate/${activationLink}`);

    userInputData.password = await bcrypt.hash(userInputData.password, SALT);

    const user = await userData.createUser(userInputData);

    await userData.createUserActivationLink(user.insertId, activationLink);

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.insertId,
      userName: userInputData.userName,
      roles: [guardUtils.siteRoles.USER]
    });
  }

  async userLogin(login, password) {
    let user;

    if (login.indexOf('@') > -1) {
      user = await userData.getUserByEmail(login);
    } else {
      user = await userData.getUserByName(login);
    }

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.USER_IS_NOT_FOUND
      );
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.WRONG_LOGIN_OR_PASSWORD
      );
    }

    const roles = await userData.getUserRoles(user.id);

    if (!roles) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.ROLES_NOT_FOUND
      );
    }

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
    });
  }

  async userLogout(refreshToken) {
    if (!refreshToken) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.LOGOUT_ERROR
      );
    }

    await tokenData.deleteRefreshToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userData.getUserByActivationLink(activationLink);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.INVALID_LINK
      );
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userData.updateUserActivationStatus(user.id);
  }

  async userForgotPassword(email) {
    const user = await userData.getUserByEmail(email);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.EMAIL_ADDRESS_NOT_FOUND
      );
    }

    const resetToken = await tokenService.generateAndSaveResetToken({
      id: user.id
    });

    await mailService.sendResetMail(
      email,
      `${process.env.API_URL}/api/v1/auth/reset/${resetToken}`
    );

    return {
      message:
        technicalMessagesUtils.authMessages.PASSWORD_RECOVERY_INSTRUCTIONS
    };
  }

  async userResetPassword(resetToken) {
    const mailToken = tokenService.validateResetToken(resetToken);

    if (!mailToken) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.LINK_EXPIRED
      );
    }

    const user = await userData.getUserById(mailToken.id);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.USER_NOT_FOUND
      );
    }

    const newPassword = utils.generatePassword();

    const newHashPassword = await bcrypt.hash(newPassword, SALT);

    await userData.updateUserPassword(mailToken.id, newHashPassword);
    await mailService.sendNewPasswordMail(user.email, newPassword);
    await tokenData.deleteResetToken(resetToken);
  }

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const cookieToken = tokenService.validateRefreshToken(refreshToken);
    const dbToken = await tokenData.getRefreshTokenByUserId(cookieToken.id);

    if (!cookieToken || !dbToken) {
      throw ApiError.unauthorizedError();
    }

    const user = await userData.getUserById(dbToken.user_id);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.USER_NOT_FOUND
      );
    }

    const roles = await userData.getUserRoles(dbToken.user_id);

    if (!roles) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.ROLES_NOT_FOUND
      );
    }

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.id,
      userName: user.user_name,
      roles: roles.map((role) => role.identifier)
    });
  }
}

module.exports = new AuthService();
