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