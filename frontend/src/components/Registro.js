import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Auth.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    telefono: '',
    edad: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí luego conectaremos con Firebase Auth y crearemos el documento en Firestore
    console.log("Datos de registro del paciente:", formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Registro de Paciente</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre Completo</label>
            <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="input-group double-col">
            <div>
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>
            <div>
              <label>Edad</label>
              <input type="number" name="edad" value={formData.edad} onChange={handleChange} required min="0" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Crear Cuenta</button>
        </form>
        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;