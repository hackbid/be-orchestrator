const axios = require("axios");

const categoryAPI =
  process.env.CATEGORY_API || "http://localhost:4002/categories";

module.exports = class CategoryController {
  static async findAll(req, res) {
    try {
      const { data } = await axios.get(categoryAPI);
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async createSubCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, imageUrl } = req.body;
      const { data } = await axios.post(`${categoryAPI}/${id}`, {
        id,
        name,
        imageUrl,
      });
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }
};
