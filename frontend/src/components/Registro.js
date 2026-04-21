import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Auth.css';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '', email: '', password: '', telefono: '', edad: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Traemos la función de login del contexto

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // 1. Enviamos los datos a nuestro backend para que cree al Paciente
      const response = await fetch('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al registrar');

      // 2. Si el backend lo creó con éxito, iniciamos sesión en el frontend
      await login(formData.email, formData.password);

      // 3. Redirigimos al usuario
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }
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