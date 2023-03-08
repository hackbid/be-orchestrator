const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

const redis = new Redis(redisUrl);

module.exports = redis;
