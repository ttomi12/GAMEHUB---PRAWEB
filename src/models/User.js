const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // uid es el identificador único que viene de Firebase
  uid: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  // Cambiamos 'name' por 'username' para que coincida con tu estructura original
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  // IMPORTANTE: required: false porque los usuarios de Google/Firebase 
  // no guardan su contraseña en nuestra base de datos
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