const axios = require("axios");
const redis = require("../../config/redis.config");
const cityAPI = process.env.CITY_API || "http://localhost:4005";

const cityCache = {
  province: "province:all",
  city: "city:all",
};

module.exports = class CityController {
  static async findAllProvince(req, res, next) {
    try {
      const cachedProvince = await redis.get(cityCache.province);
      const cachedCity = await redis.get(cityCache.city);

      if (cachedProvince && cachedCity) {
        return res.status(200).json(JSON.parse(cachedProvince));
      } else {
        const { data: provinceData } = await axios.get(cityAPI + "/province");
        const { data: cityData } = await axios.get(cityAPI + "/city");
        await redis.set(cityCache.province, JSON.stringify(provinceData));
        await redis.set(cityCache.city, JSON.stringify(cityData));
        res.status(200).json(provinceData);
      }
    } catch (err) {
      next(err);
    }
  }

  static async findCityByProvince(req, res, next) {
    try {
      const cachedCity = await redis.get(cityCache.city);
      const { province_id } = req.params;
      if (cachedCity) {
        const filteredProvince = JSON.parse(cachedCity).filter(
          (data) => data.province_id === province_id
        );
        return res.status(200).json(filteredProvince);
      } else {
        const { data } = await axios.get(cityAPI + "/city");
        const filteredProvince = data.filter(
          (data) => data.province_id === province_id
        );
        res.status(200).json(filteredProvince);
      }
    } catch (err) {
      next(err);
    }
  }

  static async findAllCities(req, res, next) {
    try {
      const cachedCity = await redis.get(cityCache.city);
      if (cachedCity) {
        return res.status(200).json(JSON.parse(cachedCity));
      } else {
        const { data } = await axios.get(cityAPI + "/city");
        await redis.set(cityCache.city, JSON.stringify(data));
        res.status(200).json(data);
      }
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
