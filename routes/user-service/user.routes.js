const upload = require('../../config/multer');

const UserController = require('../../controllers/user-service/userController');

const router = require('express').Router();

router.get('/findAll', UserController.findAll);
router.get('/findById/:id', UserController.findById);
router.post('/login', UserController.login);
router.post('/register', UserController.register);

module.exports = router;
