const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/db.config'); // Asegúrate que esto esté correcto

exports.register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    
    
    
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }    
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const userId = await userModel.createUser({ name, email, password, address });
    const user = await userModel.getUserById(userId);
    // Generar el token JWT
    const token = jwt.sign(
      { id: user.Id },
      process.env.JWT_SECRET || config.SECRET,
      { expiresIn: '' }
    );
    // Respuesta exitosa
    res.status(201).json({ 
      message: 'Nuevo usuario registrado correctamente', 
      user, 
      token 
    });
    
  }
  
  catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await userModel.getUserByEmail(email);
    if (!user || user.Password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.Id },
      process.env.JWT_SECRET || config.SECRET,
      { expiresIn: '24h' }
    );

    const { Password, ...userWithoutPassword } = user;

    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil de usuario' });
  }
};
