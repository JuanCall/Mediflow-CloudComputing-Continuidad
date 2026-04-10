const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const verificarToken = require('../middleware/authMiddleware');
const db = admin.firestore();

router.use(verificarToken);

// El paciente crea la cita en Firestore
router.post('/paciente', async (req, res) => {
    try {
        const cita = { ...req.body, pacienteId: req.user.uid };
        await db.collection('citas').add(cita);
        res.status(201).json({ message: "Creada" });
    } catch (e) { res.status(500).send(e); }
});

// El paciente ve sus citas desde Firestore
router.get('/paciente', async (req, res) => {
    try {
        const snapshot = await db.collection('citas').where('pacienteId', '==', req.user.uid).get();
        const citas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(citas);
    } catch (e) { res.status(500).send(e); }
});

// El médico ve sus citas desde Firestore
router.get('/medico', verificarToken, async (req, res) => {
    try {
        const medicoId = req.user.uid; // Este es el ID del médico que inició sesión
        console.log("Buscando citas para el médico ID:", medicoId); // Esto saldrá en tu terminal negra

        const snapshot = await db.collection('citas')
            .where('medicoId', '==', medicoId)
            .get();

        if (snapshot.empty) {
            console.log("No se encontraron citas en Firebase.");
            return res.status(200).json([]);
        }

        const citas = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(citas);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: 'Error al obtener las citas del médico' });
    }
});

module.exports = router;