class TechnicalMessagesUtils {
  get apiErrorMessages() {
    return {
      UNAUTHORIZED: 'Пользователь не авторизован',
      FORBIDDEN: 'У вас недостаточно прав для выполнения этой операции.'
    };
  }

  get authMessages() {
    return {
      NICKNAME_IS_ALREADY_REGISTERED:
        'Данный никнейм занят другим пользователем x_x',
      EMAIL_IS_ALREADY_REGISTERED:
        'Аккаунт с данным почтовым адресом уже существует >_<',
      USER_IS_NOT_FOUND: 'Пользователь с таким именем не найден :/',
      WRONG_LOGIN_OR_PASSWORD: 'Неверный лоин или пароль T_T',
      ROLES_NOT_FOUND: 'У пользователя отсутствуют назначенные роли х_X',
      INVALID_LINK: 'Ссылка распалась на пиксели, попробуй получить новую o_()',
      EMAIL_ADDRESS_NOT_FOUND:
        'Пользователь с таким почтовым адресом не найден :(',
      PASSWORD_RECOVERY_INSTRUCTIONS:
        'Инструкция по восстановлению пароля - отправлена на ваш почтовый ящик ^_^',
      LINK_EXPIRED: 'Срок действия ссылки истек x_o',
      USER_NOT_FOUND: 'Пользователь не найден o_()',
      LOGOUT_ERROR: 'Ошибка при выходе из учестной записи 0_0'
    };
  }

  get mailMessages() {
    return {
      ACTIVATION_MAIL_SUBJECT: 'Активация учетной записи Minecraft WildHunt',
      RESET_MAIL_SUBJECT:
        'Восстановление пароля учетной записи Minecraft WildHunt',
      NEW_PASSWORD_SUBJECT:
        'Новый пароль для учетной записи Minecraft WildHunt',
      ERROR_SENDING_EMAIL:
        'Ошибка при отпраке письма, возможно, почтовый ящик не существет'
    };
  }

  get codeMessages() {
    return {
      TRY_AGAIN_LATER:
        'Операция временно недоступна — попробуйте снова через некоторое время'
    };
  }
}

module.exports = new TechnicalMessagesUtils();
