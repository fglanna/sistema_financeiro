const paymentMethodService = require('../services/paymentMethodService');

class PaymentMethodController {
  async getAll(req, res, next) {
    try {
      const paymentMethods = await paymentMethodService.getAll();
      return res.status(200).json(paymentMethods);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new PaymentMethodController();
