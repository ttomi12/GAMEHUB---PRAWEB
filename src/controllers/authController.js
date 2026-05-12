const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =======================
// REGISTER
// =======================
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    user = new User({
      username,
      email,
      password: hashedPassword,
      role: 'user' // por defecto
    });

    await user.save();

    res.status(201).json({
      msg: 'Usuario registrado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// =======================
// LOGIN
// =======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({ msg: 'Faltan datos' });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Crear token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      msg: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// EXPORT CORRECTO ✅
module.exports = {
  register,
  login
};