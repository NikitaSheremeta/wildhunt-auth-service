const Joi = require('joi');
const ApiError = require('../exceptions/api-error');

module.exports = (req, res, next) => {
  const schema = Joi.object().keys({
    accessToken: Joi.string().required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(
      ApiError.badRequest(error.details[0].message, error.details[0].context)
    );
  }

  next();
};
