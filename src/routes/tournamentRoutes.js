const express = require('express');
const router = express.Router();

// Importamos los controladores (Asegúrate de que updateTournament y deleteTournament existan en tu controller)
const {
  createTournament,
  getTournaments,
  getTournamentById,
  joinTournament,
  updateTournament, // <--- Agregar esta
  deleteTournament  // <--- Agregar esta
} = require('../controllers/tournamentController');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/** * RUTAS PÚBLICAS
 */
router.get('/', getTournaments);
router.get('/:id', getTournamentById);

/**
 * RUTAS PARA USUARIOS LOGUEADOS
 */
router.post('/:id/join', auth, joinTournament);

/**
 * RUTAS SOLO PARA ADMINISTRADORES
 */
// Crear un nuevo torneo
router.post('/', auth, admin, createTournament);

// EDITAR un torneo (La que te estaba dando 404)
router.put('/:id', auth, admin, updateTournament);

// ELIMINAR un torneo (La otra que te daba 404)
router.delete('/:id', auth, admin, deleteTournament);

module.exports = router;