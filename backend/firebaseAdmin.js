const admin = require('firebase-admin');

let serviceAccount;

// Verificamos si estamos en la nube (Railway) o en local
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // En la nube, leemos la variable secreta
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // En local, leemos el archivo físico
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;