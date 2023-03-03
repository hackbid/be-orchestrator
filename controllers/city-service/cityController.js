const axios = require("axios");
const cityAPI = process.env.cityAPI || "http://localhost:4005";

module.exports = class CityController {
  static async findAllProvince(req, res) {
    try {
      const { data } = await axios.get(cityAPI + "/province");
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async findAllCities(req, res) {
    try {
      const { data } = await axios.get(cityAPI + "/city");
      res.status(200).json(data);
    } catch (err) {
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }

  static async findCost(req, res) {
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
      const { status, data } = err.response;
      res.status(status).json(data);
    }
  }
};
