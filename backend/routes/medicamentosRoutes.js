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

// 5. DESPACHAR medicamentos (Descontar stock de forma segura) (POST)
router.post('/despachar', async (req, res) => {
    const { medicamentosEntregados, pacienteId, citaId } = req.body;
    // medicamentosEntregados debe ser: [{ id: '123', cantidad: 2, nombre: 'Paracetamol' }]

    if (!medicamentosEntregados || medicamentosEntregados.length === 0) {
        return res.status(400).json({ error: 'Debe enviar al menos un medicamento para despachar.' });
    }

    try {
        // Iniciamos la TRANSACCIÓN (Todo o Nada)
        await db.runTransaction(async (transaction) => {
            const validacionesStock = [];

            // 1. Verificar Stock de todos los medicamentos antes de descontar
            for (const item of medicamentosEntregados) {
                const medRef = db.collection('medicamentos').doc(item.id);
                const medDoc = await transaction.get(medRef);

                if (!medDoc.exists) throw new Error(`MEDICAMENTO_NO_ENCONTRADO_${item.nombre}`);

                const stockActual = medDoc.data().stockActual;
                if (stockActual < item.cantidad) throw new Error(`STOCK_INSUFICIENTE_${item.nombre}`);

                // Guardamos la referencia y el nuevo cálculo
                validacionesStock.push({ ref: medRef, nuevoStock: stockActual - item.cantidad });
            }

            // 2. Si todo el stock es válido, aplicamos los descuentos
            for (const operacion of validacionesStock) {
                transaction.update(operacion.ref, { 
                    stockActual: operacion.nuevoStock,
                    fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // 3. Log de Auditoría (Recibo de Farmacia)
            const auditoriaRef = db.collection('auditoria').doc();
            transaction.set(auditoriaRef, {
                accion: 'DESPACHO_FARMACIA',
                citaReferencia: citaId || 'Venta Libre',
                pacienteId: pacienteId || 'No especificado',
                medicinasEntregadas: medicamentosEntregados,
                usuarioId: req.user ? req.user.uid : 'Farmacia/Sistema',
                fechaHora: admin.firestore.FieldValue.serverTimestamp(),
                ip: req.ip
            });
        });

        res.status(200).json({ message: 'Medicamentos despachados y stock actualizado exitosamente.' });

    } catch (error) {
        console.error("Error en despacho de farmacia:", error.message);
        if (error.message.includes('STOCK_INSUFICIENTE')) {
            const nombreMed = error.message.split('_')[2];
            return res.status(400).json({ error: `No hay stock suficiente de ${nombreMed}` });
        }
        res.status(500).json({ error: 'Error interno al procesar el despacho.' });
    }
});

module.exports = router;