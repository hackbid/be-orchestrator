const router = require("express").Router();

const CategoryRouter = require("./category/category.routes");

router.use("/categories", CategoryRouter);

module.exports = router;
