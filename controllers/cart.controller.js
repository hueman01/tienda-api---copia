const cartModel = require('../models/cart.model');

exports.getCart = async (req, res) => {
  try {
    const cartItems = await cartModel.getCartByUserId(req.user.id);
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ message: 'Error al obtener carrito' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    
    await cartModel.addToCart(req.user.id, productId, quantity);
    const updatedCart = await cartModel.getCartByUserId(req.user.id);
    
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ message: 'Error al agregar al carrito' });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 0) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }
    
    await cartModel.updateCartItem(req.user.id, productId, quantity);
    const updatedCart = await cartModel.getCartByUserId(req.user.id);
    
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ message: 'Error al actualizar carrito' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    await cartModel.removeFromCart(req.user.id, productId);
    const updatedCart = await cartModel.getCartByUserId(req.user.id);
    
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ message: 'Error al eliminar del carrito' });
  }
};