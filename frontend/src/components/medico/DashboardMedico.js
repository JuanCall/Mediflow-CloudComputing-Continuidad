import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardMedico = () => {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mi Agenda Médica 🩺</h1>
      <p>Aquí publicarás tus horarios y atenderás citas.</p>
      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};
export default DashboardMedico;