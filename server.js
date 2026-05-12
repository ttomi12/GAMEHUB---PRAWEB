const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARES 
app.use(cors());
app.use(express.json());

// 2. CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.log('❌ Error MongoDB:', err));

// 3. IMPORTACIÓN DE RUTAS
const authRoutes = require('./src/routes/authRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// 4. DEFINICIÓN DE ENDPOINTS
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);

// Ruta test
app.get('/', (req, res) => {
  res.send('API de GameHub funcionando 🚀');
});

// 5. LEVANTAR SERVIDOR 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});