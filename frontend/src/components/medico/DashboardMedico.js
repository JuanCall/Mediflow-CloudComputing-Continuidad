import React from 'react';
import { useAuth } from '../../context/AuthContext';
import PanelAtencion from './PanelAtencion';

const DashboardMedico = () => {
  const { logout } = useAuth();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white shadow-sm rounded">
        <h1 className="h3 mb-0">Mi Agenda Médica 🩺</h1>
        <button onClick={logout} className="btn btn-outline-danger">
          Cerrar Sesión
        </button>
      </div>
      
      <div className="row">
        <div className="col-12">
            <PanelAtencion />
        </div>
      </div>
    </div>
  );
};

export default DashboardMedico;