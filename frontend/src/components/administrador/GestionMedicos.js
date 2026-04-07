import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../Auth.css';

const GestionMedicos = () => {
  const { currentUser } = useAuth();
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '', email: '', password: '', telefono: '', especialidadId: ''
  });
  const [mensaje, setMensaje] = useState('');

  // Cargar datos al iniciar
  useEffect(() => {
    if (currentUser) {
      cargarMedicos();
      cargarEspecialidades();
    }
    // eslint-disable-next-line
  }, [currentUser]);

  const cargarMedicos = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/medicos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicos(data);
      }
    } catch (error) {
      console.error("Error al cargar médicos:", error);
    }
  };

  const cargarEspecialidades = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/especialidades', {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    // Buscamos el nombre de la especialidad seleccionada para guardarlo también
    const especialidadSeleccionada = especialidades.find(esp => esp.id === formData.especialidadId);
    
    if (!especialidadSeleccionada) {
      setMensaje('❌ Por favor, selecciona una especialidad válida.');
      return;
    }

    const payload = {
      ...formData,
      especialidadNombre: especialidadSeleccionada.nombre
    };

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/medicos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('Médico registrado correctamente ✅');
        setFormData({ nombreCompleto: '', email: '', password: '', telefono: '', especialidadId: '' });
        cargarMedicos(); // Recargar la tabla
      } else {
        setMensaje(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMensaje('❌ Error de conexión con el servidor');
    }
  };

  const eliminarMedico = async (uid) => {
    if (!window.confirm('¿Estás seguro de eliminar a este médico? Esto borrará su cuenta de acceso.')) return;
    
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/admin/medicos/${uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        cargarMedicos();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/dashboard-admin" style={{ textDecoration: 'none', color: '#3498db' }}>
        ← Volver al Panel
      </Link>
      
      <h2 style={{ marginTop: '20px' }}>Gestión de Médicos 👨‍⚕️</h2>
      
      {/* Formulario para registrar médico */}
      <div className="auth-box" style={{ maxWidth: '100%', marginBottom: '30px' }}>
        <h3>Registrar Nuevo Médico</h3>
        <form onSubmit={handleSubmit}>
          <div className="double-col">
            <div className="input-group">
              <label>Nombre Completo (Dr./Dra.)</label>
              <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Especialidad</label>
              <select 
                name="especialidadId" 
                value={formData.especialidadId} 
                onChange={handleChange} 
                required
                style={{ width: '100%', padding: '0.8rem', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                <option value="">-- Seleccionar --</option>
                {especialidades.map(esp => (
                  <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="double-col">
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Contraseña Provisional</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
            </div>
          </div>

          <div className="input-group" style={{ width: '49%' }}>
            <label>Teléfono</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Registrar Médico</button>
        </form>
        {mensaje && <p style={{ color: mensaje.includes('✅') ? 'green' : 'red', marginTop: '15px', textAlign: 'center' }}>{mensaje}</p>}
      </div>

      {/* Tabla de Médicos */}
      <div className="auth-box" style={{ maxWidth: '100%' }}>
        <h3>Plantilla Médica</h3>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Especialidad</th>
              <th style={{ padding: '10px' }}>Correo</th>
              <th style={{ padding: '10px' }}>Teléfono</th>
              <th style={{ padding: '10px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicos.map((medico) => (
              <tr key={medico.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}><strong>{medico.nombreCompleto}</strong></td>
                <td style={{ padding: '10px' }}>{medico.especialidadNombre}</td>
                <td style={{ padding: '10px' }}>{medico.email}</td>
                <td style={{ padding: '10px' }}>{medico.telefono}</td>
                <td style={{ padding: '10px' }}>
                  <button 
                    onClick={() => eliminarMedico(medico.id)}
                    style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {medicos.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No hay médicos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionMedicos;