import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DashboardPaciente = () => {
  const { logout } = useAuth();
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mi Portal de Paciente 🏥</h1>
      <p>Aquí reservarás citas y verás tu historial médico.</p>
      <button onClick={logout} className="btn-primary" style={{width: '200px'}}>Cerrar Sesión</button>
    </div>
  );
};
export default DashboardPaciente;