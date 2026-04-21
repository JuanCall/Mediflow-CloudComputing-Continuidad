import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../Auth.css';

const ReservarCita = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Datos maestros de la DB
  const [especialidades, setEspecialidades] = useState([]);
  const [medicosOriginales, setMedicosOriginales] = useState([]);
  const [medicosFiltrados, setMedicosFiltrados] = useState([]);

  // Datos del formulario
  const [form, setForm] = useState({
    especialidadId: '',
    medicoId: '',
    fecha: '',
    hora: ''
  });

  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Cargar especialidades y médicos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [resEsp, resMed] = await Promise.all([
          axios.get('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/admin/especialidades', { headers }),
          axios.get('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/admin/medicos', { headers })
        ]);

        setEspecialidades(resEsp.data);
        setMedicosOriginales(resMed.data);
      } catch (err) {
        setMensaje({ texto: 'Error al cargar datos iniciales', tipo: 'error' });
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  // Lógica de filtrado: Cuando cambia la especialidad, filtramos los médicos
  useEffect(() => {
    if (form.especialidadId) {
      const filtrados = medicosOriginales.filter(m => m.especialidadId === form.especialidadId);
      setMedicosFiltrados(filtrados);
      setForm(prev => ({ ...prev, medicoId: '' })); // Resetear médico si cambia especialidad
    } else {
      setMedicosFiltrados([]);
    }
  }, [form.especialidadId, medicosOriginales]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    try {
      const token = await currentUser.getIdToken();
      
      // Buscamos los nombres para guardarlos en la cita (desnormalización para facilitar lecturas)
      const espNombre = especialidades.find(e => e.id === form.especialidadId)?.nombre;
      const medNombre = medicosOriginales.find(m => m.id === form.medicoId)?.nombreCompleto;

      const payload = {
        ...form,
        especialidadNombre: espNombre,
        medicoNombre: medNombre
      };

      await axios.post('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensaje({ texto: '¡Cita reservada con éxito! Redirigiendo...', tipo: 'success' });
      
      // Esperar 2 segundos y redirigir al historial
      setTimeout(() => navigate('/dashboard-paciente/mis-citas'), 2000);

    } catch (err) {
      setMensaje({ texto: 'Error al procesar la reserva. Intenta de nuevo.', tipo: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/dashboard-paciente" style={{ textDecoration: 'none', color: '#3498db' }}>← Volver</Link>
      
      <div className="auth-box" style={{ marginTop: '20px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reservar Nueva Cita 🏥</h2>
        
        <form onSubmit={handleSubmit}>
          {/* PASO 1: Especialidad */}
          <div className="input-group">
            <label>1. Selecciona la Especialidad</label>
            <select name="especialidadId" value={form.especialidadId} onChange={handleChange} required>
              <option value="">-- Seleccionar --</option>
              {especialidades.map(esp => (
                <option key={esp.id} value={esp.id}>{esp.nombre}</option>
              ))}
            </select>
          </div>

          {/* PASO 2: Médico (Habilitado solo si hay especialidad) */}
          <div className="input-group">
            <label>2. Selecciona tu Médico</label>
            <select 
              name="medicoId" 
              value={form.medicoId} 
              onChange={handleChange} 
              required 
              disabled={!form.especialidadId}
            >
              <option value="">-- Seleccionar médico --</option>
              {medicosFiltrados.map(med => (
                <option key={med.id} value={med.id}>{med.nombreCompleto}</option>
              ))}
            </select>
            {form.especialidadId && medicosFiltrados.length === 0 && (
              <small style={{color: 'red'}}>No hay médicos disponibles para esta especialidad.</small>
            )}
          </div>

          {/* PASO 3: Fecha y Hora */}
          <div className="double-col">
            <div className="input-group">
              <label>3. Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="input-group">
              <label>4. Hora</label>
              <select name="hora" value={form.hora} onChange={handleChange} required>
                <option value="">--:--</option>
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>Confirmar Reserva</button>
        </form>

        {mensaje.texto && (
          <p style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            color: mensaje.tipo === 'success' ? '#27ae60' : '#e74c3c',
            fontWeight: 'bold'
          }}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReservarCita;