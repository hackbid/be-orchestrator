const upload = require("../../config/multer");

const UserController = require("../../controllers/user-service/userController");

const router = require("express").Router();

router.get("/findAll", UserController.findAll);
router.get("/findById/:id", UserController.findById);
router.post("/login", UserController.login);
router.post(
  "/register",
  upload.single("profileImage"),
  UserController.register
);
router.patch("/addbalance/:userId", UserController.addBalance);
router.patch("/reducebalance/:userId", UserController.reduceBalance);
router.get("/histories/:userId", UserController.getHistories);

module.exports = router;
