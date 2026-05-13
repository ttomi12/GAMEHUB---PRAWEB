const Tournament = require('../models/Tournament');

// 1. OBTENER UN SOLO TORNEO (Para la página de detalles)
const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('players', 'username');
    
    if (!tournament) {
      return res.status(404).json({ msg: 'Torneo no encontrado' });
    }
    
    res.json(tournament);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ID de torneo no válido' });
    }
    res.status(500).json({ msg: error.message });
  }
};

// 2. CREAR TORNEO (Corregido con Fecha, Hora e Imagen)
const createTournament = async (req, res) => {
  try {
    const { name, game, maxPlayers, prize, date, time, image } = req.body;

    const tournament = new Tournament({
      name,
      game,
      maxPlayers,
      prize,
      date,    // Agregado
      time,    // Agregado
      image,   // Agregado
      createdBy: req.user.id
    });

    await tournament.save();
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 3. OBTENER TODOS
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('players', 'username');
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// 4. UNIRSE A TORNEO
const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ msg: 'Torneo no encontrado' });
    }

    if (tournament.status === 'cerrado') {
      return res.status(400).json({ msg: 'Torneo cerrado' });
    }

    // Usamos el ID que viene del token (req.user.id)
    const userId = req.user.id;

    if (tournament.players.includes(userId)) {
      return res.status(400).json({ msg: 'Ya estás inscripto' });
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      tournament.status = 'cerrado';
      await tournament.save();
      return res.status(400).json({ msg: 'Torneo lleno' });
    }

    tournament.players.push(userId);

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
  getTournamentById, // Agregado al export
  joinTournament
};