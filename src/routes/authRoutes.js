const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User');

// Rutas tradicionales (Registro y Login manual)
router.post('/register', authController.register);
router.post('/login', authController.login);

// NUEVA RUTA: Sincronización con Firebase
// Esta es la que recibe los datos después del signInWithPopup/Email en el Front
router.post('/firebase-sync', async (req, res) => {
  const { uid, email, displayName } = req.body;

  try {
    // 1. Buscamos si el usuario ya existe en MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      // 2. Si no existe, lo creamos vinculándolo al UID de Firebase
      user = new User({
        uid: uid,
        email: email,
        username: displayName || email.split('@')[0], // Si no hay nombre, usa el mail
        role: 'user'
        // password no se envía, se queda vacío
      });
      await user.save();
      console.log(`✅ Usuario nuevo creado: ${email}`);
    } else {
      // 3. Si ya existe, nos aseguramos de que tenga el UID actualizado
      if (!user.uid) {
        user.uid = uid;
        await user.save();
      }
      console.log(`✅ Usuario existente logueado: ${email}`);
    }

    // Respondemos con el usuario de la DB (que incluye el campo 'role')
    res.status(200).json(user);

  } catch (error) {
    console.error('❌ Error en firebase-sync:', error);
    res.status(500).json({ msg: 'Error interno del servidor', error: error.message });
  }
});

// Ruta para subir de rango a Admin (Usa el ID de MongoDB)
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