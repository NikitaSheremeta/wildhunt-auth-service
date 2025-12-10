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
  },
  email: {
    maxLength: 255
  },
  jwt: {
    regex: /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/
  },
  code: {
    regex: /^[0-9]{4}$/
  }
};

module.exports = (req, res, next) => {
  const routePath = req.route && req.route.path;

  let schema;
  let dataToValidate;

  switch (routePath) {
    case '/registration':
      schema = Joi.object().keys({
        userName: Joi.string()
          .min(magicNumbers.userName.minLength)
          .max(magicNumbers.userName.maxLength)
          .required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .max(magicNumbers.email.maxLength)
          .required(),
        password: Joi.string()
          .alphanum()
          .min(magicNumbers.password.minLength)
          .max(magicNumbers.password.maxLength)
          .required()
      });
      dataToValidate = req.body;
      break;

    case '/login':
      schema = Joi.object().keys({
        login: Joi.string().max(magicNumbers.email.maxLength).required(),
        password: Joi.string()
          .alphanum()
          .min(magicNumbers.password.minLength)
          .max(magicNumbers.password.maxLength)
          .required()
      });
      dataToValidate = req.body;
      break;

    case '/forgot-password':
      schema = Joi.object().keys({
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .max(magicNumbers.email.maxLength)
          .required()
      });
      dataToValidate = req.body;
      break;

    case '/new-password':
      schema = Joi.object().keys({
        password: Joi.string()
          .alphanum()
          .min(magicNumbers.password.minLength)
          .max(magicNumbers.password.maxLength)
          .required(),
        code: Joi.string().pattern(magicNumbers.code.regex).required()
      });
      dataToValidate = req.body;
      break;

    case '/activate/:code':
    case '/reset/:code':
      schema = Joi.object().keys({
        code: Joi.string().pattern(magicNumbers.code.regex).required()
      });
      dataToValidate = req.params;
      break;

    default:
      return next();
  }

  const { error } = schema.validate(dataToValidate);

  if (error) {
    return next(
      ApiError.badRequest(error.details[0].message, error.details[0].context)
    );
  }

  next();
};
