const router = require("express").Router();

const CategoryRouter = require("./category/category.routes");
const ItemRouter = require("./item/item.routes");

router.use("/categories", CategoryRouter);
router.use("/items", ItemRouter);

module.exports = router;
