const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas do Dashboard exigem autenticação JWT (RN01)
router.use(authMiddleware);

// GET /api/dashboard?month=MM&year=YYYY
router.get('/', (req, res, next) => dashboardController.getDashboard(req, res, next));

module.exports = router;
