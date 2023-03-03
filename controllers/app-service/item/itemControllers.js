const axios = require("axios");
const redis = require("../../../config/redis.config");
const { invalidateCache } = require("../../../helper/invalidate.redis");
const itemAPI = process.env.itemAPI || "http://localhost:4002/items";

const itemCache = {
  items: "items/all",
};

module.exports = class ItemController {
  static async findAll(req, res) {
    try {
      const cachedData = await redis.get(itemCache.items);
      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      } else {
        const { data } = await axios.get(itemAPI);
        await redis.set(itemCache.items, JSON.stringify(data));
        res.status(200).json(data);
      }
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
      invalidateCache(itemCache.items);
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const { data } = await axios.delete(`${itemAPI}/${id}`);
      invalidateCache(itemCache.items);
      res.status(200).json(data);
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async updateItem(req, res) {
    try {
      const { UserId, amountBid } = req.body;
      const { id } = req.params;
      const { data } = await axios.put(`${itemAPI}/${id}`, {
        UserId,
        amountBid,
      });
      invalidateCache(itemCache.items);
      res.status(200).json(data);
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }
};