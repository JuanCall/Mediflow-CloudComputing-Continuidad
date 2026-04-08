import React from 'react';
import { useAuth } from '../../context/AuthContext';
import TablaCitas from './TablaCitas';

const DashboardPaciente = () => {
  const { logout } = useAuth();

  return (
    <div className="container py-4">
      {/* Encabezado del Dashboard */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold">Mi Portal de Paciente 🏥</h1>
          <p className="text-muted">Gestiona tus citas y consulta tu historial médico.</p>
        </div>
        <button 
          onClick={logout} 
          className="btn btn-outline-danger shadow-sm" 
          style={{ width: '160px', height: '45px' }}
        >
          Cerrar Sesión
        </button>
      </div>

      <hr className="mb-4" />

      {/* Sección de la Tabla y Formulario de Citas */}
      <div className="row mt-2">
        <div className="col-12">
          {/* Aquí cargamos TablaCitas, que ya incluye el formulario de reserva arriba */}
          <TablaCitas />
        </div>
      </div>

      {/* Nota: Se eliminó el botón de "Reservar Nueva Cita" de aquí abajo 
          porque ya está integrado en el componente TablaCitas */}
    </div>
  );
};

export default DashboardPaciente;