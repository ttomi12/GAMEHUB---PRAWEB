const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función auxiliar para crear el token 
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// =======================
// FIREBASE SYNC 
// =======================
const firebaseSync = async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;

    // 1. Buscar si el usuario ya existe en nuestra DB de MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Si no existe, lo creamos de cero
      user = new User({
        username: displayName || email.split('@')[0],
        email,
        uid: uid, // Guardamos el ID de Firebase
        role: 'user',
        password: await bcrypt.hash(Math.random().toString(36), 10) // Password aleatoria
      });
      await user.save();
    } else if (!user.uid) {
      // Si el usuario ya existía en DB pero no tenía linkeado el uid de Firebase, se lo asignamos
      user.uid = uid;
      await user.save();
    }

    // 3. GENERAR EL TOKEN 
    const token = createToken(user);

    // 4. Enviar respuesta con el token y el usuario 
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL || "", 
        discordId: user.discordId,     
        discordTag: user.discordTag,   
        discordAvatar: user.discordAvatar, 
        gameIds: user.gameIds || {}    
      }
    });
  } catch (error) {
    console.error("Error en firebaseSync:", error);
    res.status(500).json({ msg: 'Error al sincronizar con Firebase' });
  }
};

// =======================
// REGISTER
// =======================
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ msg: 'Faltan campos' });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, role: 'user' });
    await user.save();

    res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// =======================
// LOGIN 
// =======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales inválidas' });

    const token = createToken(user);
    res.json({
      msg: 'Login exitoso',
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        photoURL: user.photoURL || "", 
        discordId: user.discordId,     
        discordTag: user.discordTag,   
        discordAvatar: user.discordAvatar, 
        gameIds: user.gameIds || {}    
      }
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

module.exports = {
  register,
  login,
  firebaseSync 
};