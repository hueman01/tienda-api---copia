const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'La dirección es requerida' });
    }
    
    // Obtener items del carrito
    const cartItems = await cartModel.getCartByUserId(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }
    
    // Calcular total
    const total = cartItems.reduce((sum, item) => sum + (item.Precio * item.Cantidad), 0);
    
    // Preparar items para la orden
    const orderItems = cartItems.map(item => ({
      productId: item.ProductoId,
      quantity: item.Cantidad,
      price: item.Precio
    }));
    
    // Crear orden
    const orderId = await orderModel.createOrder(userId, orderItems, total, address);
    
    res.status(201).json({ orderId, message: 'Pedido creado con éxito' });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ message: 'Error al crear pedido' });
  }
};

exports.getOrderHistory = async (req, res) => {
  try {
    const orders = await orderModel.getOrderHistory(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener historial de pedidos:', error);
    res.status(500).json({ message: 'Error al obtener historial de pedidos' });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderDetails = await orderModel.getOrderDetails(req.user.id, orderId);
    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({ message: error.message || 'Error al obtener detalles del pedido' });
  }
};