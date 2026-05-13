const express = require('express');
const router = express.Router();

// Importamos los controladores (Agregamos getTournamentById)
const {
  createTournament,
  getTournaments,
  getTournamentById, // <--- Nueva función para el detalle
  joinTournament
} = require('../controllers/tournamentController');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/** * RUTAS PÚBLICAS
 */
// Obtener todos los torneos
router.get('/', getTournaments);

// Obtener un torneo específico por su ID (Necesaria para TournamentDetail.jsx)
router.get('/:id', getTournamentById);

/**
 * RUTAS PARA USUARIOS LOGUEADOS
 */
// Unirse a un torneo
router.post('/:id/join', auth, joinTournament);

/**
 * RUTAS SOLO PARA ADMINISTRADORES
 */
// Crear un nuevo torneo
router.post('/', auth, admin, createTournament);

module.exports = router;