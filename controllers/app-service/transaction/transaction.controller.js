const axios = require("axios");
const { put } = require("axios");
const transactionApi =
  process.env.transactionApi || "http://localhost:4002/transactions";
module.exports = class TransactionController {
  static async addTransaction(req, res, next) {
    try {
      const { buyerId, SellerId, ItemId, invoice, ongkir } = req.body;
      console.log(req.body);
      const { data } = await axios.post(transactionApi, {
        buyerId,
        SellerId,
        ItemId,
        invoice,
        ongkir,
      });
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async getAllTransaction(req, res, next) {
    try {
      const { data } = await axios.get(transactionApi);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async getTransaction(req, res, next) {
    try {
      const { id } = req.params;
      console.log("masuk");
      const { data } = await axios.get(`${transactionApi}/${id}`);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTransaction(req, res, next) {
    try {
      const { id } = req.params;
      console.log("masuk");
      const { data } = await axios.patch(`${transactionApi}/${id}`);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
};
