const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARES 

app.use(cors({
  origin: ['http://localhost:5173', 'https://migamehub.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// 2. CONEXIÓN A MONGODB

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1); // Si no conecta, que el servidor se detenga para avisar
  });

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

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// 5. LEVANTAR SERVIDOR 

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server corriendo en puerto ${PORT}`);
});