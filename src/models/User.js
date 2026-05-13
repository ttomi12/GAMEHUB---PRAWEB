const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String 
  }, // Opcional por usar Firebase Auth
  uid: { 
    type: String, 
    unique: true 
  }, // ID único de Firebase
  photoURL: { 
    type: String, 
    default: "" 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // --- INTEGRACIÓN CON DISCORD ---
  discordId: { 
    type: String, 
    default: null 
  },
  discordTag: { 
    type: String, 
    default: null 
  }, // Ejemplo: "User#0000" o "username"
  discordAvatar: { 
    type: String, 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);