const router = require('express').Router();
const UserRouter = require('./user.routes');
const CityRouter = require('./cities.routes');
router.use('/users', UserRouter);
router.use('/cities', CityRouter);

module.exports = router;
