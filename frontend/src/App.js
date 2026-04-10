import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Vistas Públicas
import Login from './components/Login';
import Registro from './components/Registro';

// Guardia de Seguridad
import ProtectedRoute from './components/ProtectedRoute';

// Vistas Protegidas (Dashboards)
import DashboardAdmin from './components/administrador/DashboardAdmin';
import GestionEspecialidades from './components/administrador/GestionEspecialidades';
import GestionMedicos from './components/administrador/GestionMedicos';

import DashboardMedico from './components/medico/DashboardMedico';

import DashboardPaciente from './components/paciente/DashboardPaciente';
import MisCitas from './components/paciente/MisCitas';

// Controlador de Tráfico: Decide a dónde va el usuario después de loguearse
const TrafficController = () => {
  const { userRole } = useAuth();
  if (userRole === 'Admin') return <Navigate to="/dashboard-admin" replace />;
  if (userRole === 'Médico') return <Navigate to="/dashboard-medico" replace />;
  if (userRole === 'Paciente') return <Navigate to="/dashboard-paciente" replace />;
  
  return <div>Cargando destino...</div>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Controlador de Tráfico post-login */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <TrafficController />
              </ProtectedRoute>
            } 
          />

          {/* Rutas Privadas Restringidas por Rol */}
          <Route 
            path="/dashboard-admin" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardAdmin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-admin/especialidades" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <GestionEspecialidades />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-admin/medicos" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <GestionMedicos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-medico" 
            element={
              <ProtectedRoute allowedRoles={['Médico']}>
                <DashboardMedico />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-paciente" 
            element={
              <ProtectedRoute allowedRoles={['Paciente']}>
                <DashboardPaciente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-paciente/mis-citas" 
            element={
              <ProtectedRoute allowedRoles={['Paciente']}>
                <MisCitas />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;