const Redis = require("ioredis");

const redisPort = process.env.REDIS_PORT || 6379;

const redis = new Redis(redisPort);

module.exports = redis;
