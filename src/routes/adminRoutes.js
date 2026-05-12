const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const {
  getUsers,
  changeRole,
  deleteTournament,
  getAllTournaments
} = require('../controllers/adminController');

//  ver usuarios
router.get('/users', auth, admin, getUsers);

//  cambiar rol
router.put('/users/:id/role', auth, admin, changeRole);

//  ver torneos
router.get('/tournaments', auth, admin, getAllTournaments);

//  eliminar torneo
router.delete('/tournaments/:id', auth, admin, deleteTournament);

module.exports = router;