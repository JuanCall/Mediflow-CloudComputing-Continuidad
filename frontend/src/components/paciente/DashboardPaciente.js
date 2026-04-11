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
        <Link to="/dashboard-paciente/reservar" style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#2c3e50' }}>
            <h2>➕ Reservar Cita</h2>
            <p>Agendar nueva consulta</p>
          </div>
        </Link>
        
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