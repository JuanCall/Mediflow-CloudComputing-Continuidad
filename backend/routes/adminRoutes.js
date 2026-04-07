const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const verificarToken = require('../middleware/authMiddleware');

const db = admin.firestore();

// Middleware local para verificar que el usuario sea Administrador
const verificarAdmin = async (req, res, next) => {
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection('usuarios').doc(uid).get();
        
        if (!userDoc.exists || userDoc.data().rol !== 'Admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error al verificar permisos.' });
    }
};

// Aplicamos ambos middlewares a todas las rutas de este archivo
router.use(verificarToken);
router.use(verificarAdmin);

// --------------------------------------------------------
// CRUD DE ESPECIALIDADES
// --------------------------------------------------------

// 1. CREAR una nueva especialidad (POST)
router.post('/especialidades', async (req, res) => {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio.' });
    }

    try {
        const nuevaEspecialidad = {
            nombre,
            descripcion: descripcion || '',
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('especialidades').add(nuevaEspecialidad);
        
        res.status(201).json({ 
            message: 'Especialidad creada con éxito', 
            id: docRef.id,
            ...nuevaEspecialidad
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la especialidad' });
    }
});

// 2. LEER todas las especialidades (GET)
router.get('/especialidades', async (req, res) => {
    try {
        const snapshot = await db.collection('especialidades').get();
        const especialidades = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(especialidades);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las especialidades' });
    }
});

// 3. ACTUALIZAR una especialidad existente (PUT)
router.put('/especialidades/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    try {
        const docRef = db.collection('especialidades').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Especialidad no encontrada.' });
        }

        await docRef.update({
            nombre: nombre || doc.data().nombre,
            descripcion: descripcion !== undefined ? descripcion : doc.data().descripcion,
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'Especialidad actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la especialidad' });
    }
});

// 4. ELIMINAR una especialidad (DELETE)
router.delete('/especialidades/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const docRef = db.collection('especialidades').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Especialidad no encontrada.' });
        }

        await docRef.delete();
        res.status(200).json({ message: 'Especialidad eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la especialidad' });
    }
});

// --------------------------------------------------------
// CRUD DE MÉDICOS
// --------------------------------------------------------

// 1. OBTENER todos los médicos (GET)
router.get('/medicos', async (req, res) => {
    try {
        // Buscamos en la colección usuarios SOLO a los que tienen el rol de 'Médico'
        const snapshot = await db.collection('usuarios').where('rol', '==', 'Médico').get();
        const medicos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(medicos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los médicos' });
    }
});

// 2. REGISTRAR un nuevo médico (POST)
router.post('/medicos', async (req, res) => {
    const { nombreCompleto, email, password, especialidadId, especialidadNombre, telefono } = req.body;

    if (!email || !password || !nombreCompleto || !especialidadId) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // A. Crear la cuenta en el sistema de Autenticación de Firebase
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: nombreCompleto,
        });

        // B. Guardar su perfil en Firestore con su especialidad
        await db.collection('usuarios').doc(userRecord.uid).set({
            nombreCompleto: nombreCompleto,
            email: email,
            telefono: telefono || '',
            rol: 'Médico',
            especialidadId: especialidadId,
            especialidadNombre: especialidadNombre,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ 
            message: 'Médico registrado exitosamente', 
            uid: userRecord.uid 
        });

    } catch (error) {
        console.error('Error al registrar médico:', error);
        res.status(400).json({ error: error.message });
    }
});

// 3. ELIMINAR un médico (DELETE)
router.delete('/medicos/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        // Primero lo borramos de Authentication para que no pueda loguearse
        await admin.auth().deleteUser(uid);
        
        // Luego borramos su documento de perfil en Firestore
        await db.collection('usuarios').doc(uid).delete();

        res.status(200).json({ message: 'Médico eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar médico:', error);
        res.status(500).json({ error: 'Error al eliminar al médico' });
    }
});

module.exports = router;