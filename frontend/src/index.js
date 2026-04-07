import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 1. IMPORTAMOS EL PROVEEDOR DE AUTENTICACIÓN
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. ENVOLVEMOS TODA LA APLICACIÓN CON EL PROVEEDOR */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);