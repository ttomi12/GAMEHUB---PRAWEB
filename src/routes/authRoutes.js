const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // <--- IMPORTANTE: Necesitamos firmar el token

// Rutas tradicionales
router.post('/register', authController.register);
router.post('/login', authController.login);

// NUEVA RUTA: Sincronización con Firebase (CORREGIDA)
router.post('/firebase-sync', async (req, res) => {
  const { uid, email, displayName } = req.body;

  try {
    // 1. Buscamos si el usuario ya existe en MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Si no existe, lo creamos
      user = new User({
        uid: uid,
        email: email,
        username: displayName || email.split('@')[0],
        role: 'user'
      });
      await user.save();
      console.log(`✅ Usuario nuevo creado: ${email}`);
    } else {
      // 3. Si ya existe, actualizamos UID si hace falta
      if (!user.uid) {
        user.uid = uid;
        await user.save();
      }
      console.log(`✅ Usuario existente logueado: ${email}`);
    }

    // 4. GENERAR EL TOKEN JWT (Esto es lo que faltaba)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. RESPUESTA ESTRUCTURADA
    // Enviamos el token y los datos del usuario por separado para que el Front los lea bien
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en firebase-sync:', error);
    res.status(500).json({ msg: 'Error interno del servidor', error: error.message });
  }
});

// Ruta para subir de rango a Admin
router.put('/make-admin/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;