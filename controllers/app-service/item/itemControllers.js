const { Upload } = require("@aws-sdk/lib-storage");
const axios = require("axios");
const redis = require("../../../config/redis.config");
const { s3 } = require("../../../config/S3");
const { invalidateCache } = require("../../../helper/invalidate.redis");
const itemAPI = process.env.ITEM_API;
const mongoAPI = process.env.MONGO_API;
const userAPI = process.env.USER_API;
const categoryAPI = process.env.CATEGORY_API;
const itemCache = {
  items: "items/all",
};

module.exports = class ItemController {
  static async findAll(req, res, next) {
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
      next(err);
    }
  }
  static async findItemToday(req, res, next) {
    try {
      const { data: itemToday } = await axios.get(`${itemAPI}/today`);
      const temp = itemToday.map(async (e) => {
        const { data: imagesData } = await axios.get(
          mongoAPI + `/itemImages/${e.imageMongoId}`
        );
        e.images = imagesData ? imagesData.images : [];
        return e;
      });
      const result = await Promise.all(temp);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
  static async createItem(req, res, next) {
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
        status: "posted",
        weight,
        UserId,
      });
      const imagesUrl = req.files.map(async (file) => {
        const params = {
          Bucket: "data-hackbid-app",
          Key: Math.floor(Math.random() * 1000) + "_" + `${name}_assets`,
          Body: file.buffer,
        };
        const uploadParallel = new Upload({
          client: s3,
          queueSize: 4, // optional concurrency configuration
          partSize: 5542880, // optional size of each part
          leavePartsOnError: false, // optional manually handle dropped parts
          params,
        });
        const { Location } = await uploadParallel.done();
        return Location;
      });
      const images = await Promise.all(imagesUrl);
      await axios.post(`${mongoAPI}/itemImages/${data.imageMongoId}`, {
        images,
      });
      invalidateCache(itemCache.items);
      res.status(200).json(data);
    } catch (err) {
      // next(err);
      console.log(err);
    }
  }

  static async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const { data: itemId } = await axios(`${itemAPI}/${id}`);
      const { data: imagesData } = await axios.get(
        mongoAPI + `/itemImages/${itemId.imageMongoId}`
      );
      const { data: historyData } = await axios.get(
        mongoAPI + `/itemHistory/${itemId.historyMongoId}`
      );
      const { data: UserId } = await axios.get(
        userAPI + `/users/${itemId.UserId}`
      );
      const { data: winnerId } = await axios.get(
        userAPI + `/users/${itemId.Winner.UserId}`
      );
      itemId.Winner.username = winnerId.username;
      itemId.images = imagesData ? imagesData.images : [];
      itemId.chats = historyData ? historyData.chatHistories : [];
      itemId.bids = historyData ? historyData.bidHistories : [];
      itemId.seller = UserId ? UserId : "";
      res.status(200).json(itemId);
    } catch (err) {
      next(err);
    }
  }
  static async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await axios.delete(`${itemAPI}/${id}`);
      invalidateCache(itemCache.items);
      res.status(200).json(data);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateItem(req, res, next) {
    try {
      const { UserId, amountBid } = req.body;
      const { id } = req.params;
      const { data } = await axios.put(`${itemAPI}/${id}`, {
        UserId,
        amountBid,
      });
      invalidateCache(itemCache.items);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
  static async getReporting(req, res, next) {
    const { data: report } = await axios
      .get(mongoAPI + "/reporting")
      .catch(next);
    res.json(report);
  }
  static async postReporting(req, res, next) {
    try {
      const { UserId, username, itemId, itemName, reason } = req.body;
      const { data: postReporting } = await axios.post(
        mongoAPI + "/reporting",
        {
          UserId,
          username,
          itemId,
          itemName,
          reason,
        }
      );
      res.status(201).json(postReporting);
    } catch (error) {
      next(error);
    }
  }
  static async postChat(req, res, next) {
    try {
      const { id } = req.params;
      const { username, chatValue, isSeller } = req.body;
      const { data: upPost } = await axios.post(
        mongoAPI + `/itemHistory/${id}/chat`,
        {
          username,
          chatValue,
          isSeller,
        }
      );
      res.status(201).json(upPost);
    } catch (error) {
      next(error);
    }
  }
  static async postBid(req, res, next) {
    const { UserId, username, bidValue } = req.body;
    const { id } = req.params;
    try {
      const { data: dataBid } = await axios.post(
        mongoAPI + `/itemHistory/${id}/bid`,
        {
          UserId,
          username,
          bidValue,
        }
      );
      res.status(201).json(dataBid);
    } catch (error) {
      next(error);
    }
  }
  static async itemHistory(req, res, next) {
    try {
      const { id } = req.params;
      const { data: historyItems } = await axios.get(
        mongoAPI + `/itemHistory/${id}`
      );
      res.status(200).json(historyItems);
    } catch (error) {
      next(error);
    }
  }
};
