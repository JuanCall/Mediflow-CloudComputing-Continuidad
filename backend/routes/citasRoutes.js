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

// ACTUALIZAR el estado de una cita, subir receta y DESCONTAR STOCK (PUT)
router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado, recetaUrl, medicamentosEntregados } = req.body;
    // medicamentosEntregados debe ser un array: [{ id: '123', cantidad: 2, nombre: 'Paracetamol' }]

    if (!estado) {
        return res.status(400).json({ error: 'Debes enviar un nuevo estado válido.' });
    }

    try {
        // Iniciamos una TRANSACCIÓN en Firestore (Todo o Nada)
        await db.runTransaction(async (transaction) => {
            const citaRef = db.collection('citas').doc(id);
            const citaDoc = await transaction.get(citaRef);

            if (!citaDoc.exists) {
                throw new Error('CITA_NO_ENCONTRADA');
            }

            // 1. Verificar Stock de todos los medicamentos antes de descontar
            const validacionesStock = [];
            if (medicamentosEntregados && medicamentosEntregados.length > 0) {
                for (const item of medicamentosEntregados) {
                    const medRef = db.collection('medicamentos').doc(item.id);
                    const medDoc = await transaction.get(medRef);

                    if (!medDoc.exists) {
                        throw new Error(`MEDICAMENTO_NO_ENCONTRADO_${item.nombre}`);
                    }

                    const stockActual = medDoc.data().stockActual;
                    if (stockActual < item.cantidad) {
                        throw new Error(`STOCK_INSUFICIENTE_${item.nombre}`);
                    }

                    // Guardamos la referencia para actualizarla en el siguiente paso
                    validacionesStock.push({ ref: medRef, nuevoStock: stockActual - item.cantidad });
                }
            }

            // 2. Si hay stock suficiente, aplicamos los descuentos
            for (const operacion of validacionesStock) {
                transaction.update(operacion.ref, { 
                    stockActual: operacion.nuevoStock,
                    fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // 3. Actualizamos la Cita
            const updateCitaData = { 
                estado: estado,
                fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
            };
            if (recetaUrl) updateCitaData.recetaUrl = recetaUrl;
            // Guardamos el registro de qué medicinas se dieron en esta cita
            if (medicamentosEntregados) updateCitaData.medicamentosEntregados = medicamentosEntregados;

            transaction.update(citaRef, updateCitaData);

            // 4. Log de Auditoría
            const auditoriaRef = db.collection('auditoria').doc(); // Genera un ID automático
            transaction.set(auditoriaRef, {
                accion: 'ATENCION_Y_ENTREGA_MEDICAMENTOS',
                entidadId: id,
                estadoNuevo: estado,
                medicinasEntregadas: medicamentosEntregados || [],
                usuarioId: req.user ? req.user.uid : 'Médico/Sistema',
                fechaHora: admin.firestore.FieldValue.serverTimestamp(),
                ip: req.ip
            });
        });

        res.status(200).json({ message: 'Cita actualizada y stock descontado exitosamente.' });

    } catch (error) {
        console.error("Error en la transacción de atención:", error.message);
        
        // Manejo de errores amigable para el frontend
        if (error.message.includes('STOCK_INSUFICIENTE')) {
            const nombreMed = error.message.split('_')[2];
            return res.status(400).json({ error: `No hay stock suficiente de ${nombreMed}` });
        }
        if (error.message === 'CITA_NO_ENCONTRADA') {
            return res.status(404).json({ error: 'La cita no existe.' });
        }

        res.status(500).json({ error: 'Error interno al procesar la atención médica.' });
    }
});

module.exports = router;