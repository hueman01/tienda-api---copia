const { mongoose, connect } = require('./db');

const orderItemSchema = new mongoose.Schema(
  {
    productId: Number,
    nombre: String,
    imagenUrl: String,
    quantity: Number,
    price: Number
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Procesando' }
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function ensureConnection() {
  await connect();
}

async function createOrder(userId, items, total, address, session) {
  await ensureConnection();
  const mappedItems = items.map((i) => ({
    productId: Number(i.productId),
    nombre: i.nombre,
    imagenUrl: i.imagenUrl || '',
    quantity: Number(i.quantity),
    price: Number(i.price)
  }));
  const created = await Order.create([{ userId, items: mappedItems, total, address, status: 'Confirmado' }], {
    session: session || null
  });
  const order = Array.isArray(created) ? created[0] : created;
  return order._id.toString();
}

async function getOrderHistory(userId) {
  await ensureConnection();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  return orders.map((o) => ({
    Id: o._id.toString(),
    FechaPedido: o.createdAt,
    Total: o.total,
    Estado: o.status
  }));
}

async function getOrderDetails(userId, orderId) {
  await ensureConnection();
  const order = await Order.findOne({ _id: orderId, userId }).lean();
  if (!order) throw new Error('Pedido no encontrado o no autorizado');
  return {
    orderInfo: {
      FechaPedido: order.createdAt,
      Total: order.total,
      DireccionEnvio: order.address,
      Estado: order.status
    },
    items: order.items.map((i) => ({
      ProductoId: i.productId,
      ProductoNombre: i.nombre,
      ImagenUrl: i.imagenUrl,
      Cantidad: i.quantity,
      PrecioUnitario: i.price
    }))
  };
}

module.exports = {
  Order,
  createOrder,
  getOrderHistory,
  getOrderDetails
};
