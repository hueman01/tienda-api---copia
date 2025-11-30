const PDFDocument = require('pdfkit');

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function generateOrderPdf({ user, address, cartItems, total, orderId, createdAt, preview = false }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (data) => chunks.push(data));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Comprobante de compra', { align: 'center' });
    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(preview ? 'Previsualizacion - pendiente de confirmar' : 'Confirmado', { align: 'center' });
    doc.moveDown();

    doc.fillColor('black').fontSize(12);
    doc.text(`Orden: ${orderId || 'N/A'}`);
    doc.text(`Fecha: ${new Date(createdAt || new Date()).toLocaleString()}`);
    if (user) {
      doc.text(`Cliente: ${user.Nombre || ''}`);
      doc.text(`Correo: ${user.Email || ''}`);
    }
    doc.text(`Direccion de envio: ${address || 'No especificada'}`);
    doc.moveDown();

    doc.fontSize(14).text('Productos');
    doc.moveDown(0.5);

    (cartItems || []).forEach((item, index) => {
      const subtotal = Number(item.Precio || 0) * Number(item.Cantidad || 0);
      doc
        .fontSize(12)
        .fillColor('black')
        .text(`${index + 1}. ${item.Nombre || 'Producto'} x${item.Cantidad} - ${formatCurrency(item.Precio)} c/u`);
      doc.fontSize(10).fillColor('gray').text(`Subtotal: ${formatCurrency(subtotal)}`);
      doc.moveDown(0.25);
    });

    doc.moveDown();
    doc.fontSize(14).fillColor('black').text(`Total: ${formatCurrency(total)}`, { align: 'right' });

    doc.moveDown();
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(
        'Usa los botones de Finalizar o Cancelar en la pantalla para confirmar o volver al carrito. El PDF se descargara al finalizar.'
      );

    doc.end();
  });
}

module.exports = { generateOrderPdf };
