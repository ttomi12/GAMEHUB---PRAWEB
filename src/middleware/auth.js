JavaScript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Intentar obtener el token de diferentes headers comunes
  // Algunos usan 'x-auth-token', otros 'Authorization'
  let token = req.header('x-auth-token') || req.header('Authorization');

  // 2. Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // 3. Limpiar el token si viene con el formato "Bearer <token>"
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  try {
    // 4. Verificar el token usando la clave secreta de tus variables de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Cargar los datos del usuario decodificado en el objeto request
    // Esto permite que el siguiente middleware (admin.js) sepa quién es el usuario
    req.user = decoded.user || decoded; 
    
    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};