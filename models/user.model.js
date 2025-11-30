const { mongoose, connect } = require('./db');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    Nombre: { type: String, required: true, trim: true },
    Email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    PasswordHash: { type: String, required: true },
    Direccion: { type: String, default: '' }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function ensureConnection() {
  await connect();
}

async function createUser(user) {
  await ensureConnection();
  const hash = await bcrypt.hash(user.password, 10);
  const created = await User.create({
    Nombre: user.name,
    Email: user.email,
    PasswordHash: hash,
    Direccion: user.address || ''
  });
  return created._id.toString();
}

async function getUserByEmail(email) {
  await ensureConnection();
  const doc = await User.findOne({ Email: email.toLowerCase() }).lean();
  return doc
    ? { Id: doc._id.toString(), Nombre: doc.Nombre, Email: doc.Email, PasswordHash: doc.PasswordHash, Direccion: doc.Direccion }
    : null;
}

async function getUserById(id) {
  await ensureConnection();
  const doc = await User.findById(id).lean();
  return doc
    ? { Id: doc._id.toString(), Nombre: doc.Nombre, Email: doc.Email, Direccion: doc.Direccion }
    : null;
}

module.exports = {
  User,
  createUser,
  getUserByEmail,
  getUserById
};
