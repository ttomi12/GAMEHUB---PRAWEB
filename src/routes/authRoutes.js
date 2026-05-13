const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // Middleware para proteger la ruta
const axios = require('axios');
const User = require('../models/User'); 

// Rutas existentes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-sync', authController.firebaseSync);

// ==========================================
// NUEVA RUTA: VINCULAR DISCORD
// ==========================================
router.post('/discord', auth, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ msg: 'No se proporcionó el código de Discord' });
  }

  try {
    // 1. Intercambiar el CODE por un Token de acceso con Discord
    const params = new URLSearchParams();
    params.append('client_id', process.env.DISCORD_CLIENT_ID);
    params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);

    const response = await axios.post('https://discord.com/api/oauth2/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = response.data;

    // 2. Pedirle a Discord los datos del usuario dueño de ese token
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, username, discriminator, avatar } = userResponse.data;
    
    // Formatear el tag (Discord ahora usa nombres únicos, pero mantenemos compatibilidad)
    const discordTag = discriminator !== '0' ? `${username}#${discriminator}` : username;
    const discordAvatarURL = avatar 
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` 
        : "https://cdn-icons-png.flaticon.com/512/2111/2111370.png";

    // 3. Actualizar el usuario en MongoDB usando el ID que viene del middleware 'auth'
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      {
        discordId: id,
        discordTag: discordTag,
        discordAvatar: discordAvatarURL
      },
      { new: true }
    );

    res.json({ 
      msg: '¡Discord vinculado con éxito! 🚀', 
      user: updatedUser 
    });

  } catch (err) {
    console.error('Error en Discord Auth:', err.response?.data || err.message);
    res.status(500).json({ msg: 'Hubo un error al conectar con Discord.' });
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