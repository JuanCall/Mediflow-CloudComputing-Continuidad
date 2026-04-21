const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin'); // Asegúrate de que la ruta sea correcta
const db = admin.firestore();

// 1. OBTENER todos los medicamentos (GET)
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('medicamentos').get();
        const medicamentos = [];
        
        snapshot.forEach(doc => {
            medicamentos.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(medicamentos);
    } catch (error) {
        console.error("Error al obtener medicamentos:", error);
        res.status(500).json({ error: 'Error al obtener el inventario.' });
    }
});

// 2. CREAR un nuevo medicamento (POST)
router.post('/', async (req, res) => {
    const { nombre, descripcion, stockActual, stockMinimo, precio } = req.body;

    // Validación básica
    if (!nombre || stockActual === undefined || stockMinimo === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, stockActual, stockMinimo).' });
    }

    try {
        const nuevoMedicamento = {
            nombre,
            descripcion: descripcion || '',
            stockActual: Number(stockActual),
            stockMinimo: Number(stockMinimo),
            precio: Number(precio) || 0,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('medicamentos').add(nuevoMedicamento);
        res.status(201).json({ id: docRef.id, ...nuevoMedicamento });
    } catch (error) {
        console.error("Error al crear medicamento:", error);
        res.status(500).json({ error: 'Error al registrar el medicamento.' });
    }
});

// 3. ACTUALIZAR un medicamento (PUT)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, stockActual, stockMinimo, precio } = req.body;

    try {
        const medicamentoRef = db.collection('medicamentos').doc(id);
        const doc = await medicamentoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Medicamento no encontrado.' });
        }

        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (stockActual !== undefined) updateData.stockActual = Number(stockActual);
        if (stockMinimo !== undefined) updateData.stockMinimo = Number(stockMinimo);
        if (precio !== undefined) updateData.precio = Number(precio);
        updateData.fechaActualizacion = admin.firestore.FieldValue.serverTimestamp();

        await medicamentoRef.update(updateData);
        res.status(200).json({ message: 'Medicamento actualizado correctamente.' });
    } catch (error) {
        console.error("Error al actualizar medicamento:", error);
        res.status(500).json({ error: 'Error al actualizar el inventario.' });
    }
});

// 4. ELIMINAR un medicamento (DELETE)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const medicamentoRef = db.collection('medicamentos').doc(id);
        const doc = await medicamentoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Medicamento no encontrado.' });
        }

        await medicamentoRef.delete();
        res.status(200).json({ message: 'Medicamento eliminado correctamente.' });
    } catch (error) {
        console.error("Error al eliminar medicamento:", error);
        res.status(500).json({ error: 'Error al eliminar el medicamento.' });
    }
});

module.exports = router;