const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addToCart);
router.put('/:productId', authMiddleware, cartController.updateCartItem);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);

module.exports = router;