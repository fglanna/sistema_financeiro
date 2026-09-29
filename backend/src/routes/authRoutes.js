const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middlewares/rateLimiter');

// Cadastro de usuário
router.post('/register', authController.register);

// Login de usuário (protegido por Rate Limit: 5 req / 15 min)
router.post('/login', authRateLimiter, authController.login);

// Solicitação de redefinição de senha (protegido por Rate Limit: 5 req / 15 min)
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

// Redefinição de senha via token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
