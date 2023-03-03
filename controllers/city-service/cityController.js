const axios = require("axios");
const cityAPI = process.env.cityAPI || "http://localhost:4005";

module.exports = class CityController {
  static async findAllProvince(req, res, next) {
    try {
      const { data } = await axios.get(cityAPI + "/province");
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async findAllCities(req, res, next) {
    try {
      const { data } = await axios.get(cityAPI + "/city");
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async findCost(req, res, next) {
    try {
      const { origin, destination, weight, courier } = req.body;
      const { data } = await axios.post(cityAPI + "/cost", {
        origin,
        destination,
        weight,
        courier,
      });
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
};
