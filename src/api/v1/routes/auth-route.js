const express = require('express');
const authValidation = require('../validations/auth-validation');
const authController = require('../controllers/auth-controller');

const router = express.Router();

router.post('/registration', authValidation, authController.registration);
router.post('/login', authValidation, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authValidation, authController.forgotPassword);

router.get('/activate/:code', authValidation, authController.activate);
router.get('/reset/:token', authValidation, authController.resetPassword);
router.get('/refresh', authController.refresh);

module.exports = router;
