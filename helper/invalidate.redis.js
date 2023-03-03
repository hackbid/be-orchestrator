module.exports = {
  invalidateCache: (...args) => {
    const redis = require("../config/redis.config");
    args.forEach((arg) => {
      redis.del(arg);
    });
  },
};
