const { Upload } = require('@aws-sdk/lib-storage');
const axios = require('axios');
const redis = require('../../../config/redis.config');
const { s3 } = require('../../../config/S3');
const { invalidateCache } = require('../../../helper/invalidate.redis');
const itemAPI = process.env.ITEM_API;
const mongoAPI = process.env.MONGO_API;

const itemCache = {
    items: 'items/all',
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
            const { data } = await axios.get(`${itemAPI}/today`);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }
    static async createItem(req, res, next) {
        try {
            const { name, SubCategoryId, description, startPrice, multiple, startDate, startHour, endHour, weight, UserId } = req.body;
            const { data } = await axios.post(itemAPI, {
                name,
                SubCategoryId,
                description,
                startPrice,
                multiple,
                startDate,
                startHour,
                endHour,
                status: 'posted',
                weight,
                UserId,
            });
            const imagesUrl = req.files.map(async (file) => {
                const params = {
                    Bucket: 'data-hackbid-app',
                    Key: Math.floor(Math.random() * 1000) + '_' + `${name}_assets`,
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
            await axios.post(`${mongoAPI}/itemImages/${data.imageMongoId}`, { images });
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
            console.log('masuk');
            const { data } = await axios(`${itemAPI}/${id}`);
            res.status(200).json(data);
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
};
