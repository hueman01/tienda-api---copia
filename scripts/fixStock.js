require('dotenv').config();
const { connect } = require('../models/db');
const { Product } = require('../models/product.model');

async function fixStock() {
  await connect();
  const target = 50;
  const res = await Product.updateMany(
    { $or: [{ Stock: { $exists: false } }, { Stock: { $lte: 0 } }] },
    { $set: { Stock: target } }
  );
  console.log('Productos actualizados:', res.modifiedCount);
  process.exit(0);
}

fixStock().catch((err) => {
  console.error('Error ajustando stock', err);
  process.exit(1);
});
