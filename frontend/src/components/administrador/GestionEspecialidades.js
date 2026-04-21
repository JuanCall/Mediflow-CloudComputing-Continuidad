import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../Auth.css'; // Reutilizamos los estilos base

const GestionEspecialidades = () => {
  const { currentUser } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Función para cargar la lista desde el backend
  const cargarEspecialidades = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/admin/especialidades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEspecialidades(data);
      }
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
    }
  };

  // Cargar las especialidades al abrir la pantalla
  useEffect(() => {
    if (currentUser) cargarEspecialidades();
    // eslint-disable-next-line
  }, [currentUser]);

  // Función para guardar una nueva especialidad
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/admin/especialidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, descripcion })
      });

      if (response.ok) {
        setMensaje('Especialidad agregada correctamente ✅');
        setNombre('');
        setDescripcion('');
        cargarEspecialidades(); // Recargar la tabla
      } else {
        setMensaje('❌ Error al agregar la especialidad');
      }
    } catch (error) {
      setMensaje('❌ Error de conexión');
    }
  };

  // Función para eliminar
  const eliminarEspecialidad = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta especialidad?')) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/admin/especialidades/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        cargarEspecialidades();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/dashboard-admin" style={{ textDecoration: 'none', color: '#3498db' }}>
        ← Volver al Panel
      </Link>
      
      <h2 style={{ marginTop: '20px' }}>Gestión de Especialidades 🩺</h2>
      
      {/* Formulario para agregar */}
      <div className="auth-box" style={{ maxWidth: '100%', marginBottom: '30px' }}>
        <h3>Agregar Nueva</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>
          <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
            <label>Descripción</label>
            <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 0, width: 'auto', padding: '0.8rem 1.5rem' }}>
            Guardar
          </button>
        </form>
        {mensaje && <p style={{ color: mensaje.includes('✅') ? 'green' : 'red', marginTop: '10px' }}>{mensaje}</p>}
      </div>

      {/* Tabla de resultados */}
      <div className="auth-box" style={{ maxWidth: '100%' }}>
        <h3>Especialidades Registradas</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Descripción</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {especialidades.map((esp) => (
              <tr key={esp.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}><strong>{esp.nombre}</strong></td>
                <td style={{ padding: '10px' }}>{esp.descripcion}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => eliminarEspecialidad(esp.id)}
                    style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {especialidades.length === 0 && (
              <tr>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'center' }}>No hay especialidades registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionEspecialidades;