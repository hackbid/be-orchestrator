const router = require('express').Router();

const CategoryRouter = require('./category/category.routes');

router.use('/category', CategoryRouter);

module.exports = router;