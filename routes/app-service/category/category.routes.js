const router = require("express").Router();

const CategoryController = require("../../../controllers/app-service/category/categoryController");

router.get("/", CategoryController.findAll);

router.post("/:id", CategoryController.createSubCategory);

router.delete("/:id", CategoryController.deleteSubCategory);

module.exports = router;
