import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Iniciando sesión en Mediflow con:", email);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mediflow</h2>
        <p>Bienvenido al portal médico</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-auth">Ingresar</button>
        </form>
        <p className="switch-auth">
          ¿Eres nuevo? <Link to="/register">Crea una cuenta</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;