const paymentMethodRepository = require('../repositories/paymentMethodRepository');

class PaymentMethodService {
  /**
   * Retorna a lista completa de formas de pagamento do domínio fixo.
   * @returns {Promise<Array>}
   */
  async getAll() {
    return paymentMethodRepository.findAll();
  }

  /**
   * Busca uma forma de pagamento pelo ID.
   * @param {number} id
   * @returns {Promise<Object|undefined>}
   */
  async getById(id) {
    return paymentMethodRepository.findById(id);
  }
}

module.exports = new PaymentMethodService();
