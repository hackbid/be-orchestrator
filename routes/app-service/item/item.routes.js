const router = require("express").Router();

const itemController = require("../../../controllers/app-service/item/itemControllers");

router.get("/", itemController.findAll);
router.post("/", itemController.createItem);
router.delete("/:id", itemController.deleteItem);
router.put("/:id", itemController.updateItem);

module.exports = router;
