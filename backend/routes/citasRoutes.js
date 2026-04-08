const express = require('express');
const router = express.Router();

// Cambiamos a 'let' para poder agregar elementos al array
let misCitas = [
  { id: 1, fecha: "2026-04-10", hora: "10:30 AM", medico: "Dr. García", especialidad: "Cardiología", estado: "Pendiente" }
];

// GET: Enviar las citas al frontend
router.get('/paciente', (req, res) => {
    res.json(misCitas);
});

// POST: Recibir nueva cita del frontend y guardarla
router.post('/paciente', (req, res) => {
    const nueva = { id: misCitas.length + 1, ...req.body, estado: 'Pendiente' };
    misCitas.push(nueva);
    res.status(201).json(nueva);
});

module.exports = router;