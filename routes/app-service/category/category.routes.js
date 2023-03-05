const router = require("express").Router();

const CategoryController = require("../../../controllers/app-service/category/categoryController");

router.get("/", CategoryController.findAll);

router.post("/:id", CategoryController.createSubCategory);

router.get("/:id", CategoryController.getSubCategory);

router.delete("/:id", CategoryController.deleteSubCategory);

module.exports = router;
