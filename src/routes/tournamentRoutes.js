const express = require('express');
const router = express.Router();

const {
  createTournament,
  getTournaments,
  joinTournament
} = require('../controllers/tournamentController');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

//  SOLO ADMIN
router.post('/', auth, admin, createTournament);

//  PÚBLICO
router.get('/', getTournaments);

//  SOLO LOGUEADOS
router.post('/:id/join', auth, joinTournament);

module.exports = router;