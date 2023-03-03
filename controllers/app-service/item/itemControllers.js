const axios = require("axios");
const itemAPI = process.env.itemAPI || "http://localhost:4002/items";

module.exports = class ItemController {
  static async findAll(req, res) {
    try {
      const { data } = await axios.get(itemAPI);
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async createItem(req, res) {
    try {
      const {
        name,
        SubCategoryId,
        description,
        startPrice,
        multiple,
        startDate,
        startHour,
        endHour,
        status,
        weight,
        UserId,
      } = req.body;

      const { data } = await axios.post(itemAPI, {
        name,
        SubCategoryId,
        description,
        startPrice,
        multiple,
        startDate,
        startHour,
        endHour,
        status,
        weight,
        UserId,
      });
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }
};
