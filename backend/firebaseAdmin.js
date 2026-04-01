const admin = require('firebase-admin');

// Importamos la llave privada "serviceAccountKey.json"
const serviceAccount = require('./serviceAccountKey.json');

// Inicializamos la aplicación de administrador
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;