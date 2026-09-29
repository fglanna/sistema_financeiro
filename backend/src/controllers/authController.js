const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, initial_balance } = req.body;
      const result = await authService.register({ name, email, password, initial_balance });
      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword({ email });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, new_password } = req.body;
      const result = await authService.resetPassword({ token, new_password });
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
