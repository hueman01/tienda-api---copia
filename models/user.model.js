const { sql, getConnection } = require('./db'); // Asegúrate que la ruta es correcta

async function createUser(user) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('nombre', sql.NVarChar, user.name)
      .input('email', sql.NVarChar, user.email)
      .input('password', sql.NVarChar, user.password) // contraseña sin encriptar
      .input('direccion', sql.NVarChar, user.address)
      .query(`INSERT INTO Usuarios (Nombre, Email, Password, Direccion)
              OUTPUT INSERTED.Id
              VALUES (@nombre, @email, @password, @direccion)`);
    
    return result.recordset[0].Id;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Usuarios WHERE Email = @email');
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    throw error;
  }
}

async function getUserById(id) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Id, Nombre, Email, Direccion FROM Usuarios WHERE Id = @id');
    
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById
};
