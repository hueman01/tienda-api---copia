const productModel = require('../models/product.model');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productModel.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const payload = req.body || {};
    const productData = {
      Nombre: payload.Nombre || payload.nombre,
      Precio: payload.Precio ?? payload.precio,
      Descripcion: payload.Descripcion || payload.descripcion || '',
      ImagenUrl: payload.ImagenUrl || payload.imagen || '',
      Stock: payload.Stock ?? payload.existencias ?? 0
    };

    if (!productData.Nombre || productData.Precio === undefined) {
      return res.status(400).json({ message: 'Nombre y Precio son requeridos' });
    }

    const created = await productModel.createProduct(productData);
    res.status(201).json(created);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};
    const productData = {
      Nombre: payload.Nombre || payload.nombre,
      Precio: payload.Precio ?? payload.precio,
      Descripcion: payload.Descripcion || payload.descripcion || '',
      ImagenUrl: payload.ImagenUrl || payload.imagen || '',
      Stock: payload.Stock ?? payload.existencias ?? 0
    };

    if (!productData.Nombre || productData.Precio === undefined) {
      return res.status(400).json({ message: 'Nombre y Precio son requeridos' });
    }

    const updated = await productModel.updateProduct(id, productData);
    if (!updated) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await productModel.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};
