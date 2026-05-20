const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); 
const axios = require('axios');
const User = require('../models/User'); 

// --- CONFIGURACIÓN DE MULTER LOCAL (SIN CLOUDINARY) ---
const multer = require('multer');
// Guardamos el archivo en la carpeta temporal del sistema operativo
const storage = multer.diskStorage({}); 
const uploadLocal = multer({ storage: storage });

// Rutas existentes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-sync', authController.firebaseSync);

// ==========================================
// RUTA: ACTUALIZAR PERFIL (PRUEBA LOCAL)
// ==========================================
router.put('/update-profile', [auth, uploadLocal.single('image')], async (req, res) => {
  try {
    const updateData = {};
    
    // Si Multer local procesó la imagen de forma correcta
    if (req.file) {
      console.log("¡Archivo recibido localmente con éxito!", req.file);
      // Como prueba, le asignamos una imagen por defecto para ver si guarda en la base de datos
      updateData.photoURL = "https://api.dicebear.com/7.x/avataaars/svg?seed=test";
    }

    if (req.body.username) {
      updateData.username = req.body.username;
    }
    
    if (req.body.gameIds) {
      try {
        updateData.gameIds = typeof req.body.gameIds === 'string' 
          ? JSON.parse(req.body.gameIds) 
          : req.body.gameIds;
      } catch (e) {
        updateData.gameIds = req.body.gameIds;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ 
      msg: '¡Prueba local exitosa!', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error crítico local:', err);
    res.status(500).json({ msg: 'Error interno.', error: err.message });
  }
});

// ==========================================
// VINCULAR DISCORD 
// ==========================================
router.post('/discord', auth, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ msg: 'No se proporcionó el código' });

  try {
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
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { id, username, discriminator, avatar } = userResponse.data;
    const discordTag = discriminator !== '0' ? `${username}#${discriminator}` : username;
    const discordAvatarURL = avatar 
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` 
        : "https://cdn-icons-png.flaticon.com/512/2111/2111370.png";

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { discordId: id, discordTag: discordTag, discordAvatar: discordAvatarURL },
      { new: true }
    );

    res.json({ msg: '¡Discord vinculado!', user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: 'Error en Discord.' });
  }
});

router.put('/make-admin/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

module.exports = router;