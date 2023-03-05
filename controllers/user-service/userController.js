'use strict';
const userApi = process.env.USER_API;
const { Upload } = require('@aws-sdk/lib-storage');
const { default: axios } = require('axios');
const { s3 } = require('../../config/S3');

module.exports = class UserController {
    static async findAll(req, res, next) {
        try {
            const { data } = await axios.get(userApi + '/users');
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }

    static async findById(req, res, next) {
        try {
            const { id } = req.params;
            const { data } = await axios.get(userApi + '/users/' + id);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }

    static async login(req, res, next) {
        try {
            const { data } = await axios.post(userApi + '/login', req.body);
            res.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }

    static async register(req, res, next) {
        try {
            const { buffer } = req.file;
            const { data: newUserData } = await axios.post(userApi + '/register', req.body);
            const { id, username } = newUserData.dataValues;
            const params = {
                Bucket: 'data-hackbid-app',
                Key: Math.floor(Math.random() * 1000) + '_' + `${username}_profile`,
                Body: buffer,
            };
            const uploadParallel = new Upload({
                client: s3,
                queueSize: 4, // optional concurrency configuration
                partSize: 5542880, // optional size of each part
                leavePartsOnError: false, // optional manually handle dropped parts
                params,
            });
            const { Location } = await uploadParallel.done();
            await axios.patch(userApi + `/image/${id}`, { imageProfile: Location });
            res.status(201).json({ id, username });
        } catch (err) {
            console.log(err);
            next(err);
        }
    }
    static async addBalance(req, res, next) {
        try {
            const { userId } = req.params;
            const { balance } = req.body;
            const { data } = await axios.patch(userApi + `/addbalance/${userId}`, {
                balance,
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    static async reduceBalance(req, res, next) {
        try {
            const { userId } = req.params;
            const { balance } = req.body;
            const { data } = await axios.patch(userApi + `/reducebalance/${userId}`, {
                balance,
            });
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    static async getHistories(req, res, next) {
        try {
            const { userId } = req.params;
            const { data } = await axios.get(userApi + `/histories/balance/${userId}`);
            res.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
    static async payment(req, res, next) {
        try {
            const { userId } = req.params;
            const { balance } = req.body;
            const { data } = await axios.post(userApi + `/payment/${userId}`, {
                balance,
            });
            res.status(200).json(data);
        } catch (error) {
            console.log(error);
            next(error);
        }
    }
};
