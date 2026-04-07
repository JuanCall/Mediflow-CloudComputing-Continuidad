import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Auth.css'; // Importaremos los estilos desde aquí

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego conectaremos con Firebase
    console.log("Datos de login:", { email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Iniciar Sesión en Mediflow</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="tu@correo.com"
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary">Ingresar</button>
        </form>
        <p className="auth-footer">
          ¿No tienes una cuenta como paciente? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;