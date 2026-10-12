const cronService = require('../services/cronService');

class CronController {
  async handleDailyAlerts(req, res, next) {
    try {
      const force = Boolean(req.body && req.body.force === true);
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await cronService.executeDailyAlerts({
        force,
        ip,
        userAgent
      });

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CronController();
