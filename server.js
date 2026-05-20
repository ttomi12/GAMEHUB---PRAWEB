const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// IMPORTACIONES REQUERIDAS PARA WEBSOCKETS (SALA DE CHAT)
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./src/models/Message'); // Asegúrate de crear este modelo en src/models/Message.js

const app = express();

// 1. MIDDLEWARES 
app.use(cors({
  origin: ['http://localhost:5173', 'https://migamehub.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'], 
  credentials: true
}));

app.use(express.json());

// 2. CREACIÓN DEL SERVIDOR HTTP (Envuelve la app de Express para Sockets)
const server = http.createServer(app);

// 3. INICIALIZACIÓN DE SOCKET.IO CON CONFIGURACIÓN CORS INTEGRADA
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://migamehub.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
  }
});

// 4. CONEXIÓN A MONGODB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => {
    console.error('❌ Error MongoDB:', err.message);
    process.exit(1); 
  });

// 5. IMPORTACIÓN DE RUTAS
const authRoutes = require('./src/routes/authRoutes');
const tournamentRoutes = require('./src/routes/tournamentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// 6. DEFINICIÓN DE ENDPOINTS
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);

// Ruta test 
app.get('/', (req, res) => {
  res.send('API de GameHub funcionando con WebSockets 🚀');
});

// 7. LÓGICA DE WEBSOCKETS EN TIEMPO REAL (MATCHROOM CHAT)
io.on('connection', (socket) => {
  console.log(`🔌 Usuario conectado al WebSocket: ${socket.id}`);

  // Escucha cuando un jugador entra a la pestaña del Matchroom de un torneo específico
  socket.on('join_matchroom', async ({ tournamentId }) => {
    socket.join(tournamentId);
    console.log(`👤 Jugador unido al Matchroom del torneo: ${tournamentId}`);

    // Extrae y envía el historial de chat guardado para este torneo
    try {
      const history = await Message.find({ tournamentId }).sort({ createdAt: 1 });
      socket.emit('chat_history', history);
    } catch (err) {
      console.error("❌ Error cargando historial de chat:", err.message);
    }
  });

  // Escucha cuando un participante envía un mensaje al chat
  socket.on('send_message', async (data) => {
    const { tournamentId, sender, text } = data;

    try {
      const newMessage = new Message({
        tournamentId,
        sender,
        text
      });
      await newMessage.save();

      // Transmite el mensaje únicamente a los usuarios dentro de esta sala de torneo
      io.to(tournamentId).emit('receive_message', newMessage);
    } catch (err) {
      console.error("❌ Error al procesar/guardar mensaje:", err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado del WebSocket: ${socket.id}`);
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// 8. LEVANTAR SERVIDOR USANDO SERVER (HTTP + SOCKETS)
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server corriendo en puerto ${PORT} con soporte en tiempo real.`);
});