const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/auth');
const { validateUuidParam } = require('../middlewares/validateUuid');

// Todas as rotas de lançamentos financeiros exigem autenticação JWT
router.use(authMiddleware);

// Obter lançamentos financeiros do usuário (com filtros por mês, ano, busca, categoria)
router.get('/', transactionController.getAll);

// Exportar lançamentos financeiros em CSV em memória (RN09)
router.get('/export/csv', (req, res, next) => transactionController.exportCsv(req, res, next));

// Criar novo lançamento financeiro (RN05, RN08)
router.post('/', transactionController.create);

// Obter rascunho de duplicação em memória (RN08 / Fluxo 3)
router.get('/:id/duplicate-draft', validateUuidParam('id'), transactionController.duplicateDraft);

// Obter lançamento específico por ID
router.get('/:id', validateUuidParam('id'), transactionController.getById);

// Atualizar lançamento financeiro existente (RN05, RN08)
router.put('/:id', validateUuidParam('id'), transactionController.update);

// Excluir lançamento financeiro (exclusão física)
router.delete('/:id', validateUuidParam('id'), transactionController.delete);

module.exports = router;
