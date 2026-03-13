const express = require('express');
const internalAuthController = require('../controllers/internal-auth-controller');
const internalAuthSecretMiddleware = require('../middlewares/internal-auth-secret-middleware');
const internalAuthValidation = require('../validations/internal-auth-validation');

const router = express.Router();

router.post(
  '/introspect',
  internalAuthSecretMiddleware,
  internalAuthValidation,
  internalAuthController.introspect
);

module.exports = router;
