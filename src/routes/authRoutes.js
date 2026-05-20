const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // Middleware para proteger la ruta
const axios = require('axios');
const User = require('../models/User'); 

// --- CONFIGURACIÓN DE CLOUDINARY PARA LA FOTO ---
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Usamos las variables que pusiste en Render
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gamehub_profiles',
    // Corrección: Dejamos que Cloudinary maneje el formato automáticamente
    // para evitar que Multer tire un Error 500 interno al procesar el archivo.
    resource_type: 'auto' 
  },
});

const uploadCloud = multer({ storage });

// Rutas existentes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/firebase-sync', authController.firebaseSync);

// ==========================================
// NUEVA RUTA: ACTUALIZAR PERFIL (FOTO Y MÁS)
// ==========================================
// Esta ruta es la que usará el Frontend para subir la foto
router.put('/update-profile', [auth, uploadCloud.single('image')], async (req, res) => {
  try {
    const updateData = {};
    
    // Si se subió una imagen a Cloudinary, guardamos la URL
    if (req.file && req.file.path) {
      updateData.photoURL = req.file.path;
    }

    // Permitimos actualizar otros campos si vienen en el body
    if (req.body.username) {
      updateData.username = req.body.username;
    }
    
    if (req.body.gameIds) {
      try {
        // Controlamos si viene como string de JSON o como objeto directo
        updateData.gameIds = typeof req.body.gameIds === 'string' 
          ? JSON.parse(req.body.gameIds) 
          : req.body.gameIds;
      } catch (e) {
        console.error('Error parseando gameIds:', e);
        updateData.gameIds = req.body.gameIds;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ 
      msg: '¡Perfil actualizado con éxito!', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error crítico al actualizar perfil:', err);
    res.status(500).json({ msg: 'Error al actualizar los datos del servidor.', error: err.message });
  }
});

// ==========================================
// VINCULAR DISCORD (Mantenido y Corregido)
// ==========================================
router.post('/discord', auth, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ msg: 'No se proporcionó el código de Discord' });
  }

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