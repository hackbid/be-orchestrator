const axios = require("axios");

const redis = require("../../../config/redis.config");
const { invalidateCache } = require("../../../helper/invalidate.redis");

const categoryAPI =
  process.env.CATEGORY_API || "http://localhost:4002/categories";

const categoriesCache = {
  categories: "categories/all",
  subCategories: "categories/subcategories",
};

module.exports = class CategoryController {
  static async findAll(req, res, next) {
    try {
      const cachedData = await redis.get(categoriesCache.categories);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      } else {
        const { data } = await axios.get(categoryAPI);
        await redis.set(categoriesCache.categories, JSON.stringify(data));
        res.status(200).json(data);
      }
    } catch (err) {
      next(err);
    }
  }

  static async createSubCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, imageUrl } = req.body;
      const { data } = await axios.post(`${categoryAPI}/${id}`, {
        name,
        imageUrl,
      });
      invalidateCache(
        categoriesCache.categories,
        categoriesCache.subCategories
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async getSubCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await axios(`${categoryAPI}/${id}`);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async deleteSubCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await axios.delete(`${categoryAPI}/subcategory/${id}`, {
        id,
      });
      invalidateCache(
        categoriesCache.categories,
        categoriesCache.subCategories
      );
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
};
