const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const User = require('../models/User'); // Importamos el modelo arriba

// 1. Rutas de Auth Tradicional
router.post('/register', authController.register);
router.post('/login', authController.login);

// 2. NUEVA RUTA: Sincronización con Firebase

router.post('/firebase-sync', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;

  try {
    // Buscamos si el usuario ya existe por su email
    let user = await User.findOne({ email });

    if (!user) {
      // Si no existe, lo creamos nuevo
      user = new User({
        uid: uid,
        email: email,
        name: displayName || 'Usuario de Google',
        image: photoURL,
        role: 'user' // Por defecto entra como user
      });
      await user.save();
      console.log(`✅ Usuario ${email} guardado en MongoDB`);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Error en firebase-sync:', error);
    res.status(500).json({ msg: 'Error al sincronizar usuario' });
  }
});

// 3. Ruta para hacer Admin por ID 
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