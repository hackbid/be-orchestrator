const router = require("express").Router();

const CategoryRouter = require("./category/category.routes");
const ItemRouter = require("./item/item.routes");
const TransactionRouter = require("./transaction/transaction.routes");

router.use("/categories", CategoryRouter);
router.use("/items", ItemRouter);
router.use("/transactions", TransactionRouter);

module.exports = router;
