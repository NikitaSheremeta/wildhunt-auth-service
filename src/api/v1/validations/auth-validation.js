const Joi = require('joi');
const ApiError = require('../exceptions/api-error');

const magicNumbers = {
  userName: {
    minLength: 4,
    maxLength: 24
  },
  password: {
    minLength: 8,
    maxLength: 24
  }
};

module.exports = function () {
  return (req, res, next) => {
    const route = req.url.replace('/', '');

    let schema;

    switch (route) {
      case 'registration':
        schema = Joi.object().keys({
          userName: Joi.string()
            .min(magicNumbers.userName.minLength)
            .max(magicNumbers.userName.maxLength)
            .required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          password: Joi.string()
            .alphanum()
            .min(magicNumbers.password.minLength)
            .max(magicNumbers.password.maxLength)
            .required()
        });

        break;
    }

    const { error } = schema.validate(req.body);

    if (error) {
      return next(
        ApiError.badRequest(error.details[0].message, error.details[0].context)
      );
    }

    next();
  };
};
