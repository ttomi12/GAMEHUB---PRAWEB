const Tournament = require('../models/Tournament');

// Crear torneo (admin)
const createTournament = async (req, res) => {
  try {
    const { name, game, maxPlayers, prize } = req.body;

    const tournament = new Tournament({
      name,
      game,
      maxPlayers,
      prize,
      createdBy: req.user.id
    });

    await tournament.save();

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Obtener todos
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('players', 'username');
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Unirse a torneo
const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: 'Torneo no encontrado' });
    }

    if (tournament.status === 'cerrado') {
      return res.status(400).json({ msg: 'Torneo cerrado' });
    }

    if (tournament.players.includes(req.user.id)) {
      return res.status(400).json({ msg: 'Ya estás inscripto' });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      tournament.status = 'cerrado';
      await tournament.save();
      return res.status(400).json({ msg: 'Torneo lleno' });
    }

    tournament.players.push(req.user.id);

    // Cerrar automáticamente si se llena
    if (tournament.players.length === tournament.maxPlayers) {
      tournament.status = 'cerrado';
    }

    await tournament.save();

    res.json({ msg: 'Te uniste al torneo', tournament });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  createTournament,
  getTournaments,
  joinTournament
};