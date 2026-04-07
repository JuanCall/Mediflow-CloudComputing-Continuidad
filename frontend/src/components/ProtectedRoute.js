import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole } = useAuth();

  // 1. Si no hay nadie logueado, lo botamos a la pantalla de login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si el usuario está logueado pero el backend aún no nos responde qué rol tiene
  if (currentUser && !userRole) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Verificando credenciales... 🔐</h2>
      </div>
    );
  }

  // 3. Si la ruta exige roles específicos y el rol del usuario no coincide
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Lo redirigimos a su dashboard correcto para que no se pierda
    if (userRole === 'Admin') return <Navigate to="/dashboard-admin" replace />;
    if (userRole === 'Médico') return <Navigate to="/dashboard-medico" replace />;
    return <Navigate to="/dashboard-paciente" replace />;
  }

  // 4. Si pasó todas las validaciones, lo dejamos ver la pantalla solicitada
  return children;
};

export default ProtectedRoute;