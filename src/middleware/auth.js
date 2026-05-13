onst jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Intentar obtener el token de diferentes headers
  let token = req.header('x-auth-token') || req.header('Authorization');

  // 2. Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso no válido' });
  }

  // 3. Limpiar el token si viene con el formato "Bearer <token>" (Común en Firebase/Axios)
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  try {
    // 4. Verificar el token usando la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. CARGAR LOS DATOS DEL USUARIO
    // Esta parte es vital: normalizamos el objeto para que siempre tenga el .id
    // Si el token tiene { user: { id: '...' } } o solo { id: '...' }, lo extraemos bien.
    req.user = decoded.user || decoded; 

    // Opcional: Log para debugear en la consola de Render/Node
    console.log("Token verificado para el usuario:", req.user.id || req.user._id);
    
    next();
  } catch (err) {
    console.error('Error de autenticación:', err.message);
    
    // Si el token expiró o es trucho
    res.status(401).json({ msg: 'Token inválido o expirado. Por favor, volvé a loguearte.' });
  }
};