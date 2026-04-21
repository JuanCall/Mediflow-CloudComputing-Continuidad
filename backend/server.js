require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- 1. IMPORTACIONES DE SEGURIDAD ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const app = express();
const PORT = process.env.PORT || 5000;

// --- 2. MIDDLEWARES DE SEGURIDAD ---

// a) Ocultamiento de Infraestructura y cabeceras seguras
app.use(helmet());

// b) Sanitización de inputs (previene inyección de código malicioso)
app.use(xss());

// c) Protección contra Fuerza Bruta (Rate Limiting)
// Límite estricto para los inicios de sesión
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos por IP
    message: { error: 'Demasiados intentos de inicio de sesión. Por favor, inténtalo de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Límite general para el resto de la API (previene ataques de denegación de servicio DDoS)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: { error: 'Límite de peticiones excedido.' }
});

// --- 3. MIDDLEWARES GLOBALES TRADICIONALES ---
// CORS restringido (solo permite peticiones desde tu app web y localhost)
app.use(cors({
    origin: ['https://mediflow-b62ec.web.app', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());


// --- 4. APLICACIÓN DE RUTAS ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const citasRoutes = require('./routes/citasRoutes');
const medicamentosRoutes = require('./routes/medicamentosRoutes');
const pagosRoutes = require('./routes/pagosRoutes');

// Aplicamos el limitador estricto solo a la ruta de autenticación
app.use('/api/auth', authLimiter, authRoutes);

// Aplicamos el limitador general y las rutas restantes
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/citas', apiLimiter, citasRoutes);
app.use('/api/medicamentos', apiLimiter, medicamentosRoutes);
app.use('/api/pagos', apiLimiter, pagosRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('API de Mediflow funcionando correctamente en la nube ☁️ 🛡️ (Protegida)');
});


// --- 5. MANEJADOR GLOBAL DE ERRORES SEGURO ---
// Evita que Express envíe la "pila de errores" (stack trace) exponiendo la estructura del servidor
app.use((err, req, res, next) => {
    console.error("Error capturado en el servidor:", err.message);
    res.status(500).json({
        error: 'Ocurrió un error interno en el servidor. Por favor, contacte a soporte.'
    });
});

// --- 6. INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor seguro corriendo en el puerto ${PORT}`);
});