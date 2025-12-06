const orderModel = require('../models/order.model');
const cartModel = require('../models/cart.model');
const userModel = require('../models/user.model');
const { validateAndUpdateStock, checkStockAvailability } = require('../models/product.model');
const { mongoose } = require('../models/db');
const { generateOrderPdf } = require('../utils/pdf');

function calculateTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + Number(item.Precio || 0) * Number(item.Cantidad || 0), 0);
}

exports.previewOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address } = req.body || {};
    const user = await userModel.getUserById(userId);
    const shippingAddress = address || (user ? user.Direccion : '') || 'Direccion no especificada';

    const cartItems = await cartModel.getCartByUserId(userId);
    if (!cartItems.length) {
      return res.status(400).json({ message: 'El carrito esta vacio' });
    }

    const total = calculateTotal(cartItems);
    const orderItems = cartItems.map((item) => ({
      productId: item.ProductoId,
      quantity: item.Cantidad,
      price: item.Precio,
      nombre: item.Nombre,
      imagenUrl: item.ImagenUrl
    }));

    // Validar stock antes de mostrar el PDF
    await checkStockAvailability(orderItems);

    const pdfBuffer = await generateOrderPdf({
      user,
      address: shippingAddress,
      cartItems,
      total,
      orderId: 'PREVIEW',
      createdAt: new Date(),
      preview: true
    });

    res.status(200).json({
      pdfBase64: pdfBuffer.toString('base64'),
      total,
      items: cartItems,
      address: shippingAddress,
      user
    });
  } catch (error) {
    console.error('Error al generar previsualizacion:', error);
    res.status(500).json({ message: error.message || 'Error al generar previsualizacion' });
  }
};

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.id;
    const { address } = req.body || {};
    const user = await userModel.getUserById(userId);
    const shippingAddress = address || (user ? user.Direccion : '') || 'Direccion no especificada';

    const cartItems = await cartModel.getCartByUserId(userId);
    if (!cartItems.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'El carrito esta vacio' });
    }

    const total = calculateTotal(cartItems);
    const orderItems = cartItems.map((item) => ({
      productId: item.ProductoId,
      quantity: item.Cantidad,
      price: item.Precio,
      nombre: item.Nombre,
      imagenUrl: item.ImagenUrl
    }));

    await validateAndUpdateStock(
      orderItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      session
    );

    const orderId = await orderModel.createOrder(userId, orderItems, total, shippingAddress, session);
    await cartModel.clearCart(userId, session);
    await session.commitTransaction();

    const pdfBuffer = await generateOrderPdf({
      user,
      address: shippingAddress,
      cartItems,
      total,
      orderId,
      createdAt: new Date(),
      preview: false
    });

    await orderModel.saveInvoice(orderId, pdfBuffer, `pedido-${orderId}.pdf`);

    res.status(201).json({
      orderId,
      message: 'Pedido creado con exito',
      pdfBase64: pdfBuffer.toString('base64'),
      total
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ message: error.message || 'Error al crear pedido' });
  } finally {
    session.endSession();
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
    const data = await orderModel.getOrderDetails(req.user.id, orderId);
    const orderInfo = data.orderInfo || {};
    const items = (data.items || []).map((item) => ({
      Productos: {
        ImagenUrl: item.ImagenUrl || '',
        Nombre: item.ProductoNombre
      },
      Precio: Number(item.PrecioUnitario),
      Cantidad: item.Cantidad
    }));

    res.status(200).json({
      Id: orderId,
      FechaPedido: orderInfo.FechaPedido,
      Total: orderInfo.Total,
      DireccionEnvio: orderInfo.DireccionEnvio,
      Estado: orderInfo.Estado,
      Items: items,
      hasInvoice: Boolean(data.hasInvoice)
    });
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({ message: error.message || 'Error al obtener detalles del pedido' });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const invoice = await orderModel.getInvoice(orderId, req.user.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Boleta no encontrada' });
    }
    res.status(200).json({
      pdfBase64: invoice.buffer.toString('base64'),
      filename: invoice.fileName || `pedido-${orderId}.pdf`
    });
  } catch (error) {
    console.error('Error al obtener boleta:', error);
    res.status(500).json({ message: error.message || 'Error al obtener boleta' });
  }
};
