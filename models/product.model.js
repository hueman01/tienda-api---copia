const { sql, getConnection } = require('./db');

async function getAllProducts() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Productos');
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
}

async function getProductById(id) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Productos WHERE Id = @id');
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener producto:', error);
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getProductById
};