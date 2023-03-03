'use strict';
const userApi = process.env.USER_API || 'http://localhost:4001';

const { default: axios } = require('axios');

module.exports = class UserController {
    static async findAll(req, res) {
        try {
            const { data } = await axios.get(userApi + '/users');
            res.status(200).json(data);
        } catch (err) {
            const { status, data } = err.response;
            res.status(status).json(data);
        }
    }
    static async findById(req, res) {
        try {
            const { id } = req.params;
            const { data } = await axios.get(userApi + '/users/' + id);
            res.status(200).json(data);
        } catch (err) {
            const { status, data } = err.response;
            res.status(status).json(data);
        }
    }
    static async login(req, res) {
        try {
            const { data } = await axios.post(userApi + '/login', req.body);
            res.status(200).json(data);
        } catch (err) {
            const { status, data } = err.response;
            res.status(status).json(data);
        }
    }
    static async register(req, res) {
        try {
            const { data } = await axios.post(userApi + '/register', req.body);
            res.status(200).json(data);
        } catch (err) {
            const { status, data } = err.response;
            res.status(status).json(data);
        }
    }
};
