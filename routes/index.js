const router = require('express').Router();

const UserRouter = require('./user-service/user.routes');
const CityRouter = require('./city-service/cities.routes');
const AppRouter = require('./app-service/app.routes');

router.use('/', AppRouter);
router.use('/users', UserRouter);
router.use('/cities', CityRouter);

module.exports = router;
