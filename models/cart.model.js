const { sql, getConnection } = require('./db');

async function getCartByUserId(userId) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT ci.Id, ci.ProductoId, p.Nombre, p.Precio, p.ImagenUrl, ci.Cantidad 
        FROM CarritoItems ci
        JOIN Productos p ON ci.ProductoId = p.Id
        JOIN Carritos c ON ci.CarritoId = c.Id
        WHERE c.UsuarioId = @userId
      `);
    
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    throw error;
  }
}

async function addToCart(userId, productId, quantity = 1) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Obtener o crear carrito
    let cartResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Carritos WHERE UsuarioId = @userId');
    
    let cartId;
    if (cartResult.recordset.length === 0) {
      const newCartResult = await transaction.request()
        .input('userId', sql.Int, userId)
        .query('INSERT INTO Carritos (UsuarioId) OUTPUT INSERTED.Id VALUES (@userId)');
      cartId = newCartResult.recordset[0].Id;
    } else {
      cartId = cartResult.recordset[0].Id;
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItem = await transaction.request()
      .input('cartId', sql.Int, cartId)
      .input('productId', sql.Int, productId)
      .query('SELECT Id, Cantidad FROM CarritoItems WHERE CarritoId = @cartId AND ProductoId = @productId');
    
    if (existingItem.recordset.length > 0) {
      // Actualizar cantidad
      await transaction.request()
        .input('id', sql.Int, existingItem.recordset[0].Id)
        .input('quantity', sql.Int, existingItem.recordset[0].Cantidad + quantity)
        .query('UPDATE CarritoItems SET Cantidad = @quantity WHERE Id = @id');
    } else {
      // Agregar nuevo item
      await transaction.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .input('quantity', sql.Int, quantity)
        .query('INSERT INTO CarritoItems (CarritoId, ProductoId, Cantidad) VALUES (@cartId, @productId, @quantity)');
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar al carrito:', error);
    throw error;
  }
}

async function updateCartItem(userId, productId, quantity) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Obtener carrito del usuario
    const cartResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Carritos WHERE UsuarioId = @userId');
    
    if (cartResult.recordset.length === 0) {
      throw new Error('Carrito no encontrado');
    }
    
    const cartId = cartResult.recordset[0].Id;
    
    if (quantity <= 0) {
      // Eliminar item si la cantidad es 0 o menos
      await transaction.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .query('DELETE FROM CarritoItems WHERE CarritoId = @cartId AND ProductoId = @productId');
    } else {
      // Actualizar cantidad
      await transaction.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .input('quantity', sql.Int, quantity)
        .query('UPDATE CarritoItems SET Cantidad = @quantity WHERE CarritoId = @cartId AND ProductoId = @productId');
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar carrito:', error);
    throw error;
  }
}

async function removeFromCart(userId, productId) {
  try {
    const pool = await getConnection();
    
    // Obtener carrito del usuario
    const cartResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Carritos WHERE UsuarioId = @userId');
    
    if (cartResult.recordset.length === 0) {
      throw new Error('Carrito no encontrado');
    }
    
    const cartId = cartResult.recordset[0].Id;
    
    await pool.request()
      .input('cartId', sql.Int, cartId)
      .input('productId', sql.Int, productId)
      .query('DELETE FROM CarritoItems WHERE CarritoId = @cartId AND ProductoId = @productId');
    
    return true;
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    throw error;
  }
}

module.exports = {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart
};