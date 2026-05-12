const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Agregamos el uid de Firebase
  uid: {
    type: String,
    unique: true,
    sparse: true // Permite que algunos usuarios no tengan uid (si son registros viejos)
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // IMPORTANTE: Quitamos el required de password
  // Porque los usuarios de Google no tienen password en nuestra DB
  password: {
    type: String,
    required: false 
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
