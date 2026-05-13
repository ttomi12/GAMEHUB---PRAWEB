const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  game: {
    type: String,
    required: true
  },
  maxPlayers: {
    type: Number,
    required: true
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  prize: {
    type: String
  },
  // NUEVOS CAMPOS AGREGADOS:
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '' // Si no mandás nada, se guarda vacío
  },
  status: {
    type: String,
    enum: ['abierto', 'cerrado'],
    default: 'abierto'
  },
  createdBy: {
    type: String 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tournament', tournamentSchema);