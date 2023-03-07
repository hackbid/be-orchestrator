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
router.post("/payment/:userId", UserController.payment);
///--- with draw
router.get("/withdraw/report", UserController.getWithdraw);
router.post("/withdraw/request/:id", UserController.requestWD);
router.patch("/withdraw/approve/:id", UserController.approvalWD);
router.patch("/withdraw/reject/:id", UserController.rejectWD);
///--- with draw end
module.exports = router;
