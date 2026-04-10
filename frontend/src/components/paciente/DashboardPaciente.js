import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPaciente = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mi Portal de Paciente 🏥</h1>
      <p>Bienvenido. ¿Qué deseas hacer hoy?</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', marginBottom: '30px' }}>
        {/* Este lo conectaremos en el Issue #10 */}
        <div style={{ flex: 1, background: '#f4f7f6', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#95a5a6', cursor: 'not-allowed' }}>
          <h2>➕ Reservar Cita</h2>
          <p>En desarrollo...</p>
        </div>
        
        <Link to="/dashboard-paciente/mis-citas" style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#2c3e50' }}>
            <h2>📋 Mis Citas</h2>
            <p>Ver historial y próximas citas</p>
          </div>
        </Link>
      </div>

      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardPaciente;