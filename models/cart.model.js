const { mongoose, connect } = require('./db');
const { Product } = require('./product.model');

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

async function ensureConnection() {
  await connect();
}

async function getOrCreateCart(userId, session) {
  await ensureConnection();
  let cart = await Cart.findOne({ userId }).session(session || null);
  if (!cart) {
    cart = await Cart.create([{ userId, items: [] }], { session: session || null });
    cart = Array.isArray(cart) ? cart[0] : cart;
  }
  return cart;
}

async function getCartByUserId(userId) {
  await ensureConnection();
  const cart = await getOrCreateCart(userId);
  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ Id: { $in: productIds } }).lean();
  const byId = new Map(products.map((p) => [p.Id, p]));
  // Filtrar items cuyos productos ya no existen
  cart.items = cart.items.filter((item) => byId.has(item.productId));
  await cart.save();

  return cart.items.map((item) => {
    const prod = byId.get(item.productId) || {};
    return {
      ProductoId: item.productId,
      Nombre: prod.Nombre || 'Producto',
      Precio: prod.Precio || 0,
      ImagenUrl: prod.ImagenUrl || '',
      Cantidad: item.quantity,
      StockDisponible: typeof prod.Stock === 'number' ? prod.Stock : null
    };
  });
}

async function addToCart(userId, productId, quantity = 1) {
  await ensureConnection();
  const product = await Product.findOne({ Id: Number(productId) }).lean();
  if (!product) throw new Error('Producto no encontrado');
  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find((i) => i.productId === Number(productId));
  const currentQty = existing ? existing.quantity : 0;
  const requested = Number(quantity);
  const available = typeof product.Stock === 'number' ? product.Stock : Infinity;
  if (requested <= 0) throw new Error('Cantidad invalida');
  if (currentQty + requested > available) {
    throw new Error('No hay stock suficiente para agregar al carrito');
  }
  if (existing) existing.quantity = currentQty + requested;
  else cart.items.push({ productId: Number(productId), quantity: requested });
  await cart.save();
  return true;
}

async function updateCartItem(userId, productId, quantity) {
  await ensureConnection();
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.productId === Number(productId));
  if (!item) throw new Error('Item no encontrado');
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== Number(productId));
  } else {
    const product = await Product.findOne({ Id: Number(productId) }).lean();
    const available = product && typeof product.Stock === 'number' ? product.Stock : Infinity;
    if (quantity > available) {
      throw new Error('No hay stock suficiente para esa cantidad');
    }
    item.quantity = Number(quantity);
  }
  await cart.save();
  return true;
}

async function removeFromCart(userId, productId) {
  await ensureConnection();
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((i) => i.productId !== Number(productId));
  await cart.save();
  return true;
}

async function clearCart(userId, session) {
  await ensureConnection();
  const cart = await getOrCreateCart(userId, session);
  cart.items = [];
  await cart.save({ session: session || null });
}

module.exports = {
  Cart,
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
