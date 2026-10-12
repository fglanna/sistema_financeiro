const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/auth');
const { validateUuidParam } = require('../middlewares/validateUuid');

// Todas as rotas de categorias exigem autenticação JWT
router.use(authMiddleware);

// Obter categorias padrão + personalizadas do usuário
router.get('/', categoryController.getAll);

// Criar nova categoria personalizada
router.post('/', categoryController.create);

// Atualizar categoria personalizada existente (RN08)
router.put('/:id', validateUuidParam('id'), categoryController.update);

// Excluir categoria personalizada (RN08 / ON DELETE RESTRICT)
router.delete('/:id', validateUuidParam('id'), categoryController.delete);

module.exports = router;
