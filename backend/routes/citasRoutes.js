const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const verificarToken = require('../middleware/authMiddleware');

const db = admin.firestore();

// Todas las rutas de citas requieren que el usuario esté autenticado
router.use(verificarToken);

// --------------------------------------------------------
// ENDPOINTS PARA EL PACIENTE
// --------------------------------------------------------

// 1. CREAR una nueva cita (POST)
router.post('/', async (req, res) => {
    const { medicoId, medicoNombre, especialidadId, especialidadNombre, fecha, hora } = req.body;
    const pacienteId = req.user.uid; // El ID lo sacamos del token de seguridad de forma automática

    if (!medicoId || !fecha || !hora) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para agendar la cita.' });
    }

    try {
        // Obtenemos el nombre del paciente desde la base de datos para guardarlo en la cita
        const pacienteDoc = await db.collection('usuarios').doc(pacienteId).get();
        const pacienteNombre = pacienteDoc.exists ? pacienteDoc.data().nombreCompleto : 'Paciente';

        const nuevaCita = {
            pacienteId,
            pacienteNombre,
            medicoId,
            medicoNombre,
            especialidadId,
            especialidadNombre,
            fecha,
            hora,
            estado: 'Pendiente', // Todas las citas inician como pendientes
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('citas').add(nuevaCita);
        
        res.status(201).json({ message: 'Cita agendada con éxito', id: docRef.id });
    } catch (error) {
        console.error('Error al crear la cita:', error);
        res.status(500).json({ error: 'Error al procesar la cita' });
    }
});

// 2. OBTENER el historial de citas del Paciente (GET)
router.get('/paciente', async (req, res) => {
    const pacienteId = req.user.uid;

    try {
        // Buscamos solo las citas donde pacienteId coincida con el usuario logueado
        const snapshot = await db.collection('citas').where('pacienteId', '==', pacienteId).get();
        const citas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(citas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las citas del paciente' });
    }
});

// --------------------------------------------------------
// ENDPOINTS PARA EL MÉDICO
// --------------------------------------------------------

// 3. OBTENER la agenda de citas del Médico (GET)
router.get('/medico', async (req, res) => {
    const medicoId = req.user.uid;

    try {
        // Buscamos solo las citas asignadas a este médico específico
        const snapshot = await db.collection('citas').where('medicoId', '==', medicoId).get();
        const citas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(citas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la agenda del médico' });
    }
});

// 4. ACTUALIZAR el estado de una cita (y adjuntar receta) (PUT)
router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado, recetaUrl } = req.body; // <-- Ahora recibimos recetaUrl

    if (!estado) {
        return res.status(400).json({ error: 'Debes enviar un nuevo estado válido.' });
    }

    try {
        const citaRef = db.collection('citas').doc(id);
        const doc = await citaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Cita no encontrada.' });
        }

        // Preparamos los datos a actualizar
        const updateData = { 
            estado: estado,
            fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
        };

        // Si el médico envió un archivo, lo agregamos a la base de datos
        if (recetaUrl) {
            updateData.recetaUrl = recetaUrl;
        }

        await citaRef.update(updateData);

        res.status(200).json({ message: `Cita actualizada a estado: ${estado}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
    }
});

module.exports = router;