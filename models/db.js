const sql = require('mssql');
require('dotenv').config(); // Asegúrate de cargar las variables aquí también

// Validación de variables de entorno
if (!process.env.DB_SERVER) {
  throw new Error('Falta la variable DB_SERVER en .env');
}

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Cambia a true para Azure
    trustServerCertificate: true // Necesario para desarrollo local
  }
};

console.log('Intentando conectar con configuración:', {
  server: dbConfig.server,
  database: dbConfig.database,
  user: dbConfig.user,
  port: dbConfig.port
});

async function getConnection() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Conexión exitosa a la base de datos');
    return pool;
  } catch (error) {
    console.error('Error detallado al conectar:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

module.exports = { getConnection, sql };