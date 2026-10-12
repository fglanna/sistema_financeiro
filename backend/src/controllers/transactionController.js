const transactionService = require('../services/transactionService');

class TransactionController {
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const { month, year, search, category_id } = req.query;
      const transactions = await transactionService.getAll(userId, {
        month,
        year,
        search,
        category_id,
      });
      return res.status(200).json(transactions);
    } catch (err) {
      return next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const transaction = await transactionService.getById(id, userId);
      return res.status(200).json(transaction);
    } catch (err) {
      return next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const created = await transactionService.create(userId, req.body);
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }

  async duplicateDraft(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const draft = await transactionService.duplicateDraft(id, userId);
      return res.status(200).json(draft);
    } catch (err) {
      return next(err);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updated = await transactionService.update(id, userId, req.body);
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await transactionService.delete(id, userId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TransactionController();
