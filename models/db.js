const mongoose = require('mongoose');
require('dotenv').config();

const dbName = process.env.MONGO_DBNAME || 'Tienda';
const uri = process.env.MONGO_URI || `mongodb://localhost:27017/${dbName}`;
const options = {
  dbName,
  serverSelectionTimeoutMS: 10000
};

function withAuthSource(u) {
  if (u.includes('authSource=')) return u;
  const hasQuery = u.includes('?');
  return hasQuery ? `${u}&authSource=admin` : `${u}?authSource=admin`;
}

let cached = null;

async function connect() {
  if (cached) return cached;
  mongoose.set('strictQuery', true);
  const finalUri = withAuthSource(uri);
  cached = mongoose
    .connect(finalUri, options)
    .then(() => {
      console.log('MongoDB conectado');
      return mongoose.connection;
    })
    .catch((err) => {
      console.error('Error conectando a MongoDB', err.message);
      process.exit(1);
    });
  return cached;
}

module.exports = { mongoose, connect };
