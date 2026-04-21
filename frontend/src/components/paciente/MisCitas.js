import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../Auth.css';

const MisCitas = () => {
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NUEVO: Estado para bloquear el botón mientras "el banco" procesa
  const [procesandoPagoId, setProcesandoPagoId] = useState(null);

  // NUEVO: URL de tu simulador de pagos
  const API_URL_PAGOS = 'https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/pagos/procesar';

  // Movimos cargarCitas afuera para poder reutilizarla al pagar
  const cargarCitas = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas/paciente', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      } else {
        setError('No se pudieron cargar las citas.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) cargarCitas();
  }, [currentUser]);

  // Función de Pago
  const handlePagar = async (citaId) => {
    setProcesandoPagoId(citaId); // Iniciamos el spinner

    try {
      const response = await fetch(API_URL_PAGOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citaId: citaId,
          pacienteId: currentUser.uid,
          monto: 50.00, 
          metodoPago: 'Tarjeta'
        })
      });

      if (response.ok) {
        alert('✅ ¡Pago exitoso! Tu comprobante ha sido generado.');
        cargarCitas(); // Recargamos la tabla para que aparezca como "Pagado"
      } else {
        const errorData = await response.json();
        alert(`❌ Error en el pago: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión. Intente nuevamente.");
    } finally {
      setProcesandoPagoId(null); // Apagamos el spinner
    }
  };

  // Función para darle color al "Estado" (Badges)
  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return '#f39c12'; // Naranja
      case 'Atendida': return '#27ae60'; // Verde
      case 'Cancelada': return '#e74c3c'; // Rojo
      default: return '#7f8c8d'; // Gris
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/dashboard-paciente" style={{ textDecoration: 'none', color: '#3498db' }}>
        ← Volver al Portal
      </Link>
      
      <h2 style={{ marginTop: '20px' }}>Mis Citas Programadas 📅</h2>

      <div className="auth-box" style={{ maxWidth: '100%', marginTop: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando historial de citas...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Fecha</th>
                <th style={{ padding: '10px' }}>Hora</th>
                <th style={{ padding: '10px' }}>Médico</th>
                <th style={{ padding: '10px' }}>Especialidad</th>
                <th style={{ padding: '10px' }}>Estado</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Pago</th> {/* NUEVA COLUMNA */}
              </tr>
            </thead>
            <tbody>
              {citas.length > 0 ? (
                citas.map((cita) => (
                  <tr key={cita.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}><strong>{cita.fecha}</strong></td>
                    <td style={{ padding: '10px' }}>{cita.hora}</td>
                    <td style={{ padding: '10px' }}>{cita.medicoNombre}</td>
                    <td style={{ padding: '10px' }}>{cita.especialidadNombre}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        background: getEstadoColor(cita.estado), 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {cita.estado}
                      </span>
                    </td>
                    {/* NUEVO: LÓGICA DEL BOTÓN DE PAGO */}
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {cita.estadoPago === 'Pagado' ? (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✅ Abonado</span>
                      ) : (
                        <button 
                          onClick={() => handlePagar(cita.id)}
                          disabled={procesandoPagoId === cita.id}
                          style={{
                            background: procesandoPagoId === cita.id ? '#95a5a6' : '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: procesandoPagoId === cita.id ? 'wait' : 'pointer',
                            fontWeight: 'bold',
                            transition: '0.3s'
                          }}
                        >
                          {procesandoPagoId === cita.id ? '⏳ Procesando...' : '💸 Pagar ($50)'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                    Aún no tienes citas médicas programadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MisCitas;