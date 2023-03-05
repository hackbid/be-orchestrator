const router = require('express').Router();
const upload = require('../../../config/multer');

const itemController = require('../../../controllers/app-service/item/itemControllers');

router.get('/', itemController.findAll);
router.get('/today', itemController.findItemToday);
router.post('/', upload.array('images'), itemController.createItem);
router.delete('/:id', itemController.deleteItem);
router.get('/:id', itemController.getItemById);
router.put('/:id', itemController.updateItem);

module.exports = router;
