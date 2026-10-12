const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas de formas de pagamento exigem autenticação JWT
router.use(authMiddleware);

// Obter formas de pagamento do domínio fixo
router.get('/', paymentMethodController.getAll);

module.exports = router;
