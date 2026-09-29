const userService = require('../services/userService');

class UserController {
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await userService.getProfile(userId);
      return res.status(200).json(profile);
    } catch (err) {
      return next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, initial_balance } = req.body;
      const updatedProfile = await userService.updateProfile(userId, { name, initial_balance });
      return res.status(200).json(updatedProfile);
    } catch (err) {
      return next(err);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await userService.deleteAccount(userId, { ipAddress, userAgent });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new UserController();
