import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'paciente',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log("Registrando en Mediflow:", formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mediflow</h2>
        <p>Registro de nuevo usuario</p>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nombre Completo</label>
            <input name="name" type="text" placeholder="Andryck Rios" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input name="email" type="email" placeholder="correo@ejemplo.com" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Tipo de Usuario</label>
            <select name="role" className="auth-select" onChange={handleChange}>
              <option value="paciente">Paciente</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-auth">Registrarme</button>
        </form>
        <p className="switch-auth">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;