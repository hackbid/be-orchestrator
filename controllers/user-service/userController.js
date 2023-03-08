"use strict";
const userApi = process.env.USER_API;
const emailApi = process.env.EMAIL_API;
const { Upload } = require("@aws-sdk/lib-storage");
const { default: axios } = require("axios");
const { s3 } = require("../../config/S3");

module.exports = class UserController {
  static async findAll(req, res, next) {
    try {
      const { data } = await axios.get(userApi + "/users");
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
  static async findById(req, res, next) {
    try {
      const { id } = req.params;
      const { data } = await axios.get(userApi + "/users/" + id);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
  static async login(req, res, next) {
    try {
      const { data } = await axios.post(userApi + "/login", req.body);
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
  static async register(req, res, next) {
    try {
      const { buffer } = req.file;
      const { data: newUserData } = await axios.post(
        userApi + "/register",
        req.body
      );
      const { id, username } = newUserData.dataValues;
      const params = {
        Bucket: "data-hackbid-app",
        Key: Math.floor(Math.random() * 1000) + "_" + `${username}_profile`,
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
      const { data } = await axios.get(
        userApi + `/histories/balance/${userId}`
      );
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
  static async getWithdraw(req, res, next) {
    try {
      const { data: dataWithdraw } = await axios.get(userApi + "/reportwd");
      let temp = dataWithdraw.map(async (e) => {
        const { data: dataUser } = await axios.get(
          userApi + `/users/${e.UserId}`
        );
        e.user = dataUser ? dataUser.username : "";
        return e;
      });

      let result = await Promise.all(temp);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  static async requestWD(req, res, next) {
    const { id } = req.params;
    const { balance } = req.body;
    try {
      const { data: reportWd } = await axios.post(userApi + `/reportwd/${id}`, {
        balance,
      });
      const { data: userData } = await axios.get(userApi + `/users/${id}`);
      await axios.post(emailApi + "/topup", {
        mailto: userData.email,
        user: userData.fullName,
        balance: balance,
      });
      res.status(200).json(reportWd);
    } catch (error) {
      next(error);
    }
  }
  static async approvalWD(req, res, next) {
    try {
      const { id } = req.params;
      const { data: resApproval } = await axios.patch(
        userApi + `/approve/${id}`
      );

      res.status(200).json(resApproval);
    } catch (error) {
      next(error);
    }
  }
  static async rejectWD(req, res, next) {
    const { id } = req.params;
    try {
      const { data: resReject } = await axios.patch(
        userApi + `/reportwd/${id}`
      );
      const { data: userData } = await axios.get(userApi + `/users/${id}`);
      await axios.post(emailApi + "/rejected", {
        mailto: userData.email,
        user: userData.fullName,
      });
      res.status(200).json(resReject);
    } catch (error) {
      next(error);
    }
  }
};
