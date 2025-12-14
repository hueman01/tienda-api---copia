const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const orderController = require('./controllers/order.controller');
const authMiddleware = require('./middlewares/auth');
const siteInfoRoutes = require('./routes/siteInfo.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/info', siteInfoRoutes);

// Alias directo para evitar 404 si las rutas no se recargan
app.post('/api/orders/preview', authMiddleware, orderController.previewOrder);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Tienda Online');
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

module.exports = app;
