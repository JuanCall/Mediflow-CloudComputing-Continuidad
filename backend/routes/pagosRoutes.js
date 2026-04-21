const express = require('express');
const router = express.Router();
const admin = require('../firebaseAdmin');
const db = admin.firestore();

// SIMULADOR DE PASARELA DE PAGOS (POST)
router.post('/procesar', async (req, res) => {
    const { citaId, pacienteId, monto, metodoPago } = req.body;
    // metodoPago puede ser: 'Tarjeta', 'Efectivo', 'Transferencia'

    if (!citaId || !monto) {
        return res.status(400).json({ error: 'Faltan datos para procesar el pago.' });
    }

    try {
        // 1. Verificar que la cita exista y no esté pagada ya
        const citaRef = db.collection('citas').doc(citaId);
        const citaDoc = await citaRef.get();

        if (!citaDoc.exists) return res.status(404).json({ error: 'Cita no encontrada.' });
        if (citaDoc.data().estadoPago === 'Pagado') {
            return res.status(400).json({ error: 'Esta cita ya ha sido pagada.' });
        }

        // 2. SIMULAR EL TIEMPO DE RESPUESTA DEL BANCO (Retraso de 2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Iniciamos Transacción para guardar el recibo y actualizar la cita al mismo tiempo
        await db.runTransaction(async (transaction) => {
            
            // A. Actualizar la Cita
            transaction.update(citaRef, {
                estadoPago: 'Pagado',
                fechaPago: admin.firestore.FieldValue.serverTimestamp()
            });

            // B. Generar el Comprobante Electrónico (Voucher)
            const reciboRef = db.collection('comprobantes').doc();
            transaction.set(reciboRef, {
                citaId: citaId,
                pacienteId: pacienteId || 'Desconocido',
                montoCobrado: Number(monto),
                metodo: metodoPago || 'Simulado',
                estadoTransaccion: 'Aprobado',
                fechaEmision: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        res.status(200).json({ 
            message: 'Pago procesado exitosamente. Transacción aprobada.',
            estado: 'Pagado'
        });

    } catch (error) {
        console.error("Error en el simulador de pagos:", error);
        res.status(500).json({ error: 'Error al procesar la transacción bancaria simulada.' });
    }
});

module.exports = router;