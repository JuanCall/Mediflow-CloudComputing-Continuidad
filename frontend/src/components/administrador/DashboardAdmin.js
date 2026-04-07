import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardAdmin = () => {
  const { logout } = useAuth();
  
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Panel de Control - Administrador ⚙️</h1>
      <p>Bienvenido. Selecciona el módulo que deseas administrar:</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', marginBottom: '30px' }}>
        <Link to="/dashboard-admin/especialidades" style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#2c3e50' }}>
            <h2>🩺 Especialidades</h2>
            <p>Gestionar catálogo</p>
          </div>
        </Link>
        
        <Link to="/dashboard-admin/medicos" style={{ flex: 1, textDecoration: 'none' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', color: '#2c3e50' }}>
            <h2>👨‍⚕️ Médicos</h2>
            <p>Gestionar plantilla médica</p>
          </div>
        </Link>
      </div>

      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardAdmin;
