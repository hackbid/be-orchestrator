const { Upload } = require("@aws-sdk/lib-storage");
const axios = require("axios");
const redis = require("../../../config/redis.config");
const { s3 } = require("../../../config/S3");
const { invalidateCache } = require("../../../helper/invalidate.redis");
const itemAPI = process.env.ITEM_API;
const mongoAPI = process.env.MONGO_API;
const userAPI = process.env.USER_API;
const cityAPI = process.env.CITY_API;
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
      ``;
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

      let user = itemId.Winner.UserId;
      const { data: winnerId } = await axios.get(userAPI + `/users/${user}`);
      itemId.Winner.username = winnerId.username;
      itemId.images = imagesData ? imagesData.images : [];
      itemId.chats = historyData ? historyData.chatHistories : [];
      itemId.bids = historyData ? historyData.bidHistories : [];
      itemId.seller = UserId ? UserId : "";
      res.status(200).json(itemId);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  static async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await axios.delete(`${itemAPI}/${id}`);
      invalidateCache(itemCache.items);
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
    try {
      const { data: report } = await axios.get(mongoAPI + "/reporting");
      const temp = report.map(async (e) => {
        const { data: itemData } = await axios.get(itemAPI + `/${e.itemId}`);
        const { data: imageData } = await axios.get(
          mongoAPI + `/itemImages/${itemData.imageMongoId}`
        );
        e.item = itemData ? itemData : {};
        e.image = imageData ? imageData.images : [];
        return e;
      });

      res.status(200).json(await Promise.all(temp));
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  static async postReporting(req, res, next) {
    try {
      const { UserId, username, itemId, itemName, reason } = req.body;
      const { data: checkItem } = await axios.get(
        mongoAPI + `/reporting/find/${itemId}`
      );
      if (checkItem.message == "already reported") throw Error;
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
  static async deleteReporting(req, res, next) {
    const { id } = req.params;
    try {
      const { data: findId } = await axios.get(mongoAPI + `/reporting/${id}`);
      const { data: deleteReport } = await axios.delete(
        mongoAPI + `/reporting/${id}`
      );
      let itemId = findId.itemId;
      await axios.delete(itemAPI + `/${itemId}`);
      invalidateCache(itemCache.items);
      res.status(200).json(deleteReport);
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
  static async myAuction(req, res, next) {
    try {
      const { userId } = req.params;
      const { data: dataAuction } = await axios.get(
        itemAPI + `/auction/${userId}`
      );
      res.status(200).json(dataAuction);
    } catch (error) {
      next(error);
    }
  }
  static async myWinner(req, res, next) {
    try {
      const { userId } = req.params;
      const { data: myWinner } = await axios.get(
        itemAPI + `/youwinner/${userId}`
      );
      const result = await Promise.all(
        myWinner.map(async (e) => {
          const { data: imagesData } = await axios.get(
            mongoAPI + `/itemImages/${e.Item.imageMongoId}`
          );
          const { data: userData } = await axios.get(
            userAPI + `/users/${e.Item.UserId}`
          );
          const { data: custData } = await axios.get(
            userAPI + `/users/${e.UserId}`
          );
          const { data: Cost } = await axios.post(cityAPI + "/cost", {
            origin: userData.city_id,
            destination: custData.city_id,
            weight: e.Item.weight,
            courier: "jne",
          });
          return {
            ...e,
            origin: {
              seller: userData.fullName,
              city_id: userData.city_id,
              weight: e.Item.weight,
            },
            destination: {
              winner: custData.fullName,
              city_id: custData.city_id,
            },
            images: imagesData ? imagesData.images : [],
            cost: Cost[0].costs[0].cost[0].value,
          };
        })
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
};
