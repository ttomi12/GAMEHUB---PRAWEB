const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Rutas
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

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