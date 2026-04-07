const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin'); // Configuración de Firebase Admin
const verificarToken = require('../middleware/authMiddleware'); // Middleware

// Inicializamos la conexión a la base de datos Firestore
const db = admin.firestore();

// --------------------------------------------------------
// 1. REGISTRO DE PACIENTES (Público)
// --------------------------------------------------------
router.post('/registro', async (req, res) => {
    const { email, password, nombreCompleto, telefono, edad } = req.body;

    // Validación básica de campos
    if (!email || !password || !nombreCompleto) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // A. Crear el usuario en el sistema de Autenticación de Firebase
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: nombreCompleto,
        });

        // B. Guardar la información adicional en la base de datos Firestore
        // Usamos el mismo UID de Auth como ID del documento en la colección 'usuarios'
        await db.collection('usuarios').doc(userRecord.uid).set({
            nombreCompleto: nombreCompleto,
            email: email,
            telefono: telefono,
            edad: parseInt(edad),
            rol: 'Paciente', // REGLA DE NEGOCIO 02: Registro público es siempre Paciente
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        });

        // C. Responder al frontend que todo salió bien
        res.status(201).json({
            message: 'Paciente registrado exitosamente',
            uid: userRecord.uid
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);
        // Firebase devuelve errores específicos (ej. correo ya en uso)
        res.status(400).json({ error: error.message });
    }
});

// --------------------------------------------------------
// 2. OBTENER PERFIL Y ROL (Protegido)
// --------------------------------------------------------
// Nota: El frontend valida la contraseña. Luego llama a esta ruta con su token
// para saber si debe cargar el Dashboard de Paciente, Médico o Admin.
router.get('/me', verificarToken, async (req, res) => {
    try {
        // El UID viene del token decodificado por tu middleware
        const uid = req.user.uid; 

        // Buscamos al usuario en la base de datos
        const userDoc = await db.collection('usuarios').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Perfil de usuario no encontrado' });
        }

        // Devolvemos los datos del usuario (incluyendo su rol)
        res.status(200).json(userDoc.data());

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;