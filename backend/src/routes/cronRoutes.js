const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');
const { cronAuthMiddleware } = require('../middlewares/cronAuth');

// Rota de disparo de alertas diários por e-mail (RN07)
// Protegida exclusivamente por CRON_SECRET via cabeçalho Authorization: Bearer <CRON_SECRET>
router.post('/daily-alerts', cronAuthMiddleware, (req, res, next) => {
  cronController.handleDailyAlerts(req, res, next);
});

module.exports = router;
