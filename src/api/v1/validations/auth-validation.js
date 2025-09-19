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
  }
};

module.exports = (req, res, next) => {
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
          .max(magicNumbers.email.maxLength)
          .required(),
        password: Joi.string()
          .alphanum()
          .min(magicNumbers.password.minLength)
          .max(magicNumbers.password.maxLength)
          .required()
      });
      break;

    case 'login':
      schema = Joi.object().keys({
        login: Joi.string().max(magicNumbers.email.maxLength).required(),
        password: Joi.string()
          .alphanum()
          .min(magicNumbers.password.minLength)
          .max(magicNumbers.password.maxLength)
          .required()
      });
      break;

    case 'forgot-password':
      schema = Joi.object().keys({
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .max(magicNumbers.email.maxLength)
          .required()
      });
      break;

    case '/activate/:link':
      schema = Joi.object().keys({
        link: Joi.string()
          .guid({ version: ['uuidv4'] })
          .required()
      });
      break;

    case '/reset/:token':
      schema = Joi.object().keys({
        token: Joi.string().pattern(magicNumbers.jwt.regex).required()
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
