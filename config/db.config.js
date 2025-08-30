module.exports = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  SECRET: 'hola1234', // Cambia esto por tu secreto JWT 
  options: {
    encrypt: true, // Para Azure SQL
    trustServerCertificate: true // Para desarrollo local
  }
};