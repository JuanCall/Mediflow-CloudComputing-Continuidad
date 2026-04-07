import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardAdmin = () => {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Panel de Control - Administrador ⚙️</h1>
      <p>Aquí gestionarás médicos, especialidades y verás reportes.</p>
      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};
export default DashboardAdmin;