const User = require('../models/User');
const Tournament = require('../models/Tournament');

//  ver todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//  cambiar rol
const changeRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Rol inválido' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//  ver todos los torneos
const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('players', 'username');
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//  eliminar torneo
const deleteTournament = async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Torneo eliminado' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  getUsers,
  changeRole,
  getAllTournaments,
  deleteTournament
};