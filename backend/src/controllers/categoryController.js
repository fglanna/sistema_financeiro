const categoryService = require('../services/categoryService');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const categories = await categoryService.getAll(userId);
      return res.status(200).json(categories);
    } catch (err) {
      return next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, type } = req.body;
      const category = await categoryService.create(userId, { name, type });
      return res.status(201).json(category);
    } catch (err) {
      return next(err);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { name, type } = req.body;
      const updated = await categoryService.update(id, userId, { name, type });
      return res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await categoryService.delete(id, userId);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new CategoryController();
