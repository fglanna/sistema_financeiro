const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas de usuários exigem autenticação JWT
router.use(authMiddleware);

// Obter dados do perfil do usuário autenticado
router.get('/me', userController.getProfile);

// Atualizar dados do perfil (Nome e Saldo Inicial)
router.put('/me', userController.updateProfile);

// Exclusão definitiva da conta de usuário (RN10)
router.delete('/me', userController.deleteAccount);

module.exports = router;
