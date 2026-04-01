const admin = require('../firebaseAdmin');

const verificarToken = async (req, res, next) => {
    // 1. Verificar si el token viene en los headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    // 2. Extraer el token (quitando la palabra "Bearer ")
    const idToken = authHeader.split('Bearer ')[1];

    try {
        // 3. Verificar el token con Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // 4. Adjuntar los datos del usuario a la petición (req.user) para usarlos en las rutas
        req.user = decodedToken;
        
        // 5. Dejar pasar a la siguiente función
        next();
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = verificarToken;