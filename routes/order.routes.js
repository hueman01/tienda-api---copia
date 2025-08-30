const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/history', authMiddleware, orderController.getOrderHistory);
router.get('/:orderId', authMiddleware, orderController.getOrderDetails);

module.exports = router;