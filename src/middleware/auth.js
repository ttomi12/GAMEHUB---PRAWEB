const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
  // 1. Intentar obtener el token
  let token = req.header('x-auth-token') || req.header('Authorization');

  // 2. Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // 3. Limpiar el token si viene con el formato "Bearer <token>"
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim(); 
  }

  try {
    // 4. Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Cargar los datos
    
    req.user = decoded; 
    
    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    res.status(401).json({ msg: 'Token inválido o expirado' });
  }
};