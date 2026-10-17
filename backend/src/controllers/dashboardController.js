const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      let { month, year } = req.query;

      // Valores padrão: mês e ano correntes no fuso de Brasília caso não informados
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const parsedMonth = month ? parseInt(month, 10) : currentMonth;
      const parsedYear = year ? parseInt(year, 10) : currentYear;

      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ error: 'O parâmetro month deve ser um número inteiro entre 1 e 12.' });
      }

      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2200) {
        return res.status(400).json({ error: 'O parâmetro year deve ser um ano válido.' });
      }

      const data = await dashboardService.getDashboardData(userId, parsedMonth, parsedYear);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
