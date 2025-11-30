const { mongoose, connect } = require('./db');

const productSchema = new mongoose.Schema(
  {
    Id: { type: Number, unique: true, index: true },
    Nombre: { type: String, required: true, trim: true },
    Precio: { type: Number, required: true, min: 0 },
    Descripcion: { type: String, default: '' },
    ImagenUrl: { type: String, default: '' },
    Stock: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function ensureConnection() {
  await connect();
}

async function getNextId() {
  const last = await Product.findOne().sort({ Id: -1 }).lean();
  return last ? last.Id + 1 : 1;
}

async function getAllProducts() {
  await ensureConnection();
  // Solo productos con stock disponible
  return Product.find({ Stock: { $gt: 0 } }).sort({ Id: 1 }).lean();
}

async function getProductById(id) {
  await ensureConnection();
  return Product.findOne({ Id: Number(id) }).lean();
}

async function updateProduct(id, data) {
  await ensureConnection();
  const numericId = Number(id);
  const query = Number.isNaN(numericId)
    ? { _id: id }
    : { $or: [{ Id: numericId }, { _id: id }] };

  const updated = await Product.findOneAndUpdate(
    query,
    {
      $set: {
        Nombre: data.Nombre,
        Precio: Number(data.Precio),
        Descripcion: data.Descripcion || '',
        ImagenUrl: data.ImagenUrl || '',
        Stock: Number(data.Stock || 0)
      }
    },
    { new: true }
  ).lean();
  return updated;
}

async function deleteProduct(id) {
  await ensureConnection();
  const query = Number.isNaN(Number(id))
    ? { _id: id }
    : { $or: [{ Id: Number(id) }, { _id: id }] };
  const res = await Product.deleteOne(query);
  return res.deletedCount > 0;
}

async function createProduct(data) {
  await ensureConnection();
  const Id = data.Id ? Number(data.Id) : await getNextId();
  const created = await Product.create({ ...data, Id, Stock: Number(data.Stock || 0) });
  return created.toObject();
}

async function validateAndUpdateStock(items, session) {
  await ensureConnection();
  const productIds = items.map((i) => Number(i.productId));
  const docs = await Product.find({ Id: { $in: productIds } }).session(session || null);
  const byId = new Map(docs.map((p) => [p.Id, p]));

  for (const item of items) {
    const product = byId.get(Number(item.productId));
    if (!product) {
      throw new Error(`Producto ${item.productId} no encontrado`);
    }
    const available = Number(product.Stock || 0);
    if (available < Number(item.quantity)) {
      throw new Error(`Stock insuficiente para ${product.Nombre}`);
    }
  }

  for (const item of items) {
    const product = byId.get(Number(item.productId));
    const newStock = Number(product.Stock || 0) - Number(item.quantity);
    if (newStock <= 0) {
      await Product.deleteOne({ _id: product._id }).session(session || null);
    } else {
      await Product.updateOne({ _id: product._id }, { $set: { Stock: newStock } }).session(session || null);
    }
  }
}

async function checkStockAvailability(items, session) {
  await ensureConnection();
  const productIds = items.map((i) => Number(i.productId));
  const docs = await Product.find({ Id: { $in: productIds } }).session(session || null);
  const byId = new Map(docs.map((p) => [p.Id, p]));

  for (const item of items) {
    const product = byId.get(Number(item.productId));
    if (!product) {
      throw new Error(`Producto ${item.productId} no encontrado`);
    }
    const available = Number(product.Stock || 0);
    if (available < Number(item.quantity)) {
      throw new Error(`Stock insuficiente para ${product.Nombre}`);
    }
  }
  return true;
}

module.exports = {
  Product,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  validateAndUpdateStock,
  checkStockAvailability
};
