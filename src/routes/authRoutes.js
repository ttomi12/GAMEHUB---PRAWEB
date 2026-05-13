const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rutas limpias que llaman al controlador
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-sync', authController.firebaseSync);

// Ruta para subir de rango a Admin
router.put('/make-admin/:id', async (req, res) => {
  try {
    const User = require('../models/User'); 
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