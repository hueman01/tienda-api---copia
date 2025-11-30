require('dotenv').config();
const { connect } = require('./models/db');
const app = require('./app');

const PORT = process.env.PORT || 3000;

connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('No se pudo iniciar el servidor', err);
});

// node server.js
