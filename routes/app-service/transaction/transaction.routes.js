const router = require("express").Router();

const transactionController = require("../../../controllers/app-service/transaction/transaction.controller");

router.post("/", transactionController.addTransaction);
router.get("/:id", transactionController.getTransaction);
router.put("/:id", transactionController.updateTransaction);

module.exports = router;
