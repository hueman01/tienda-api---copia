const { sql, getConnection } = require('./db');

async function createOrder(userId, items, total, address) {
  const pool = await getConnection();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Crear el pedido
    const orderResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('total', sql.Decimal(10, 2), total)
      .input('address', sql.NVarChar, address)
      .query(`
        INSERT INTO Pedidos (UsuarioId, Total, DireccionEnvio) 
        OUTPUT INSERTED.Id
        VALUES (@userId, @total, @address)
      `);
    
    const orderId = orderResult.recordset[0].Id;
    
    // Agregar items del pedido
    for (const item of items) {
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.productId)
        .input('quantity', sql.Int, item.quantity)
        .input('price', sql.Decimal(10, 2), item.price)
        .query(`
          INSERT INTO PedidoItems (PedidoId, ProductoId, Cantidad, PrecioUnitario)
          VALUES (@orderId, @productId, @quantity, @price)
        `);
    }
    
    // Limpiar carrito
    const cartResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Carritos WHERE UsuarioId = @userId');
    
    if (cartResult.recordset.length > 0) {
      const cartId = cartResult.recordset[0].Id;
      await transaction.request()
        .input('cartId', sql.Int, cartId)
        .query('DELETE FROM CarritoItems WHERE CarritoId = @cartId');
    }
    
    await transaction.commit();
    return orderId;
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear pedido:', error);
    throw error;
  }
}

async function getOrderHistory(userId) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT p.Id, p.FechaPedido, p.Total, p.Estado
        FROM Pedidos p
        WHERE p.UsuarioId = @userId
        ORDER BY p.FechaPedido DESC
      `);
    
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener historial de pedidos:', error);
    throw error;
  }
}

async function getOrderDetails(userId, orderId) {
  try {
    const pool = await getConnection();
    
    // Verificar que el pedido pertenece al usuario
    const orderResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Pedidos WHERE Id = @orderId AND UsuarioId = @userId');
    
    if (orderResult.recordset.length === 0) {
      throw new Error('Pedido no encontrado o no autorizado');
    }
    
    // Obtener detalles del pedido
    const detailsResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT pi.ProductoId, pr.Nombre as ProductoNombre, pi.Cantidad, pi.PrecioUnitario
        FROM PedidoItems pi
        JOIN Productos pr ON pi.ProductoId = pr.Id
        WHERE pi.PedidoId = @orderId
      `);
    
    const orderInfoResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT FechaPedido, Total, DireccionEnvio, Estado FROM Pedidos WHERE Id = @orderId');
    
    return {
      orderInfo: orderInfoResult.recordset[0],
      items: detailsResult.recordset
    };
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    throw error;
  }
}

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderDetails
};