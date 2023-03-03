const router = require('express').Router();
const CityController = require('../controllers/cityController');
router.get('/province', CityController.findAllProvince);
router.get('/city', CityController.findAllCities);
router.post('/cost', CityController.findCost);

module.exports = router;
