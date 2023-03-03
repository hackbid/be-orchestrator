const router = require("express").Router();

const itemController = require("../../../controllers/app-service/item/itemControllers");

router.get("/", itemController.findAll);
router.post("/", itemController.createItem);

module.exports = router;
