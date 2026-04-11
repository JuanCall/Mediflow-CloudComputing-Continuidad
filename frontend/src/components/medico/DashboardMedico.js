import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardMedico = () => {
  const { logout, currentUser } = useAuth();
  
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Portal del Médico 👨‍⚕️</h1>
      <p>Bienvenido. ¿Qué deseas gestionar hoy?</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', marginBottom: '30px' }}>
        <Link to="/dashboard-medico/agenda" style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#2c3e50' }}>
            <h2>📋 Mi Agenda</h2>
            <p>Ver pacientes y atender citas</p>
          </div>
        </Link>
      </div>

      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardMedico;