require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('../models/db');
const { Product } = require('../models/product.model');
const { User } = require('../models/user.model');

async function seed() {
  await connect();

  const products = [
    {
      Id: 1,
      Nombre: 'Audifonos Bluetooth',
      Precio: 29.99,
      Descripcion: 'Auriculares inalambricos con cancelacion pasiva',
      ImagenUrl: 'https://images.unsplash.com/photo-1518443895911-7bf2a5f4a39a?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 15
    },
    {
      Id: 2,
      Nombre: 'Teclado Mecanico RGB',
      Precio: 89.99,
      Descripcion: 'Switches azules, retroiluminacion RGB',
      ImagenUrl: 'https://images.unsplash.com/photo-1587202372775-98927c9d4c01?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 12
    },
    {
      Id: 3,
      Nombre: 'Mouse Gamer',
      Precio: 39.99,
      Descripcion: 'Sensor 16K DPI, 7 botones programables',
      ImagenUrl: 'https://images.unsplash.com/photo-1584907797070-13df03aeb3f0?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 20
    },
    {
      Id: 4,
      Nombre: 'Monitor 24" 144Hz',
      Precio: 199.99,
      Descripcion: 'Panel IPS, 1ms, FreeSync',
      ImagenUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 8
    },
    {
      Id: 5,
      Nombre: 'SSD NVMe 1TB',
      Precio: 109.99,
      Descripcion: 'Lectura 3500MB/s, escritura 3000MB/s',
      ImagenUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 18
    },
    {
      Id: 6,
      Nombre: 'Router WiFi 6',
      Precio: 129.99,
      Descripcion: 'Dual-band, OFDMA, MU-MIMO',
      ImagenUrl: 'https://images.unsplash.com/photo-1605902711810-3c5d2a30c5cc?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 10
    },
    {
      Id: 7,
      Nombre: 'Smartwatch',
      Precio: 149.99,
      Descripcion: 'GPS, monitor cardiaco, 7 dias de bateria',
      ImagenUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 16
    },
    {
      Id: 8,
      Nombre: 'Cargador GaN 65W',
      Precio: 39.99,
      Descripcion: 'USB-C PD, compacto, multi-dispositivo',
      ImagenUrl: 'https://images.unsplash.com/photo-1582719478289-5934a78a4ec1?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 25
    },
    {
      Id: 9,
      Nombre: 'Power Bank 20,000mAh',
      Precio: 49.99,
      Descripcion: 'PD 45W, USB-C + USB-A',
      ImagenUrl: 'https://images.unsplash.com/photo-1527863280617-4907c6eb21e5?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 14
    },
    {
      Id: 10,
      Nombre: 'Camara Web 1080p',
      Precio: 59.99,
      Descripcion: 'Full HD, microfono integrado',
      ImagenUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&h=400&q=80',
      Stock: 11
    }
  ];

  for (const p of products) {
    await Product.updateOne({ Id: p.Id }, { $set: p }, { upsert: true });
  }

  const users = [
    { Nombre: 'Ana Perez', Email: 'ana@example.com', Password: '123456', Direccion: 'Calle 1 #123' },
    { Nombre: 'Luis Gomez', Email: 'luis@example.com', Password: '123456', Direccion: 'Avenida 9 #456' }
  ];

  for (const u of users) {
    const existing = await User.findOne({ Email: u.Email.toLowerCase() });
    if (existing) continue;
    const hash = await bcrypt.hash(u.Password, 10);
    await User.create({ Nombre: u.Nombre, Email: u.Email.toLowerCase(), PasswordHash: hash, Direccion: u.Direccion });
  }

  console.log('Seed completado');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Error en seed', e);
  process.exit(1);
});
