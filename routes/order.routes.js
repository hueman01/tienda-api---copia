const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth');

router.post('/preview', authMiddleware, orderController.previewOrder);
router.post('/', authMiddleware, orderController.createOrder);
router.get('/history', authMiddleware, orderController.getOrderHistory);
router.get('/:orderId', authMiddleware, orderController.getOrderDetails);
router.get('/:orderId/invoice', authMiddleware, orderController.getInvoice);

module.exports = router;
