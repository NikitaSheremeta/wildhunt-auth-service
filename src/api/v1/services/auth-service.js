const userQuery = require('../queries/user-query');
const ApiError = require('../exceptions/api-error');
const technicalMessagesUtils = require('../utils/technical-messages-utils');
const uuid = require('uuid');
// const mailService = require('./mail-service');
const bcrypt = require('bcrypt');
const tokenService = require('./token-service');
const guardUtils = require('../utils/guard-utils');
const tokenQuery = require('../queries/token-query');
const utils = require('../utils/utils');

const SALT = 10;

class AuthService {
  async userRegistration(userInputData) {
    console.log('2');

    const userName = await userQuery.getUserByName(userInputData.userName);

    console.log('userName', userName);

    console.log('3');

    const userEmail = await userQuery.getUserByEmail(userInputData.email);

    console.log('4');

    if (userName) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.NICKNAME_IS_ALREADY_REGISTERED
      );
    }

    console.log('5');

    if (userEmail) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.EMAIL_IS_ALREADY_REGISTERED
      );
    }

    console.log('6');

    const activationLink = uuid.v4();

    console.log('7');

    // I guess if the mail obviously doesn't exist,
    // there is no need to create a user.
    // That is why sending a letter before creating a user to the database.
    // await mailService.sendActivationMail(
    //   userInputData.email,
    //   `${process.env.API_URL}/api/v1/auth/activate/${activationLink}`
    // );

    console.log('activationLink', `/api/v1/auth/activate/${activationLink}`);

    userInputData.password = await bcrypt.hash(userInputData.password, SALT);

    console.log('8');

    const user = await userQuery.createUser(userInputData);

    console.log('9');

    await userQuery.createUserActivationLink(user.insertId, activationLink);

    console.log('10');

    return await tokenService.generateAndSaveRefreshTokens({
      id: user.insertId,
      userName: userInputData.userName,
      roles: [guardUtils.siteRoles.USER]
    });
  }

  async userLogin(login, password) {
    let user;

    if (login.indexOf('@') > -1) {
      user = await userQuery.getUserByEmail(login);
    } else {
      user = await userQuery.getUserByName(login);
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

    const roles = await userQuery.getUserRoles(user.id);

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

    await tokenQuery.deleteRefreshToken(refreshToken);
  }

  async userActivation(activationLink) {
    const user = await userQuery.getUserByActivationLink(activationLink);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.INVALID_LINK
      );
    }

    if (user.is_activation_status !== 0) {
      return false;
    }

    await userQuery.updateUserActivationStatus(user.id);
  }

  async userForgotPassword(email) {
    const user = await userQuery.getUserByEmail(email);

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

    const user = await userQuery.getUserById(mailToken.id);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.USER_NOT_FOUND
      );
    }

    const newPassword = utils.generatePassword();

    const newHashPassword = await bcrypt.hash(newPassword, SALT);

    await userQuery.updateUserPassword(mailToken.id, newHashPassword);
    await mailService.sendNewPasswordMail(user.email, newPassword);
    await tokenQuery.deleteResetToken(resetToken);
  }

  async userRefreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }

    const cookieToken = tokenService.validateRefreshToken(refreshToken);
    const dbToken = await tokenQuery.getRefreshTokenByUserId(cookieToken.id);

    if (!cookieToken || !dbToken) {
      throw ApiError.unauthorizedError();
    }

    const user = await userQuery.getUserById(dbToken.user_id);

    if (!user) {
      throw ApiError.badRequest(
        technicalMessagesUtils.authMessages.USER_NOT_FOUND
      );
    }

    const roles = await userQuery.getUserRoles(dbToken.user_id);

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
