const router = require("express").Router();
const upload = require("../../../config/multer");
const ItemController = require("../../../controllers/app-service/item/itemControllers");

const itemController = require("../../../controllers/app-service/item/itemControllers");

router.get("/", itemController.findAll);
router.get("/today", itemController.findItemToday);
router.get("/report", itemController.getReporting);
router.post("/report", itemController.postReporting);
router.post("/chat/:id", itemController.postChat);
router.post("/bid/:id", ItemController.postBid);
router.post("/", upload.array("images"), itemController.createItem);
router.delete("/:id", itemController.deleteItem);
router.get("/:id", itemController.getItemById);
router.put("/:id", itemController.updateItem);

module.exports = router;
