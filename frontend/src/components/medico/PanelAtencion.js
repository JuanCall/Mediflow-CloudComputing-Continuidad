import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../../firebaseConfig';

import axios from 'axios';
import '../../Auth.css';

const PanelAtencion = () => {
  const { currentUser } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [archivoReceta, setArchivoReceta] = useState(null);

  const cargarAgenda = async () => {
    try {
      const token = await currentUser.getIdToken();
      // Usamos axios en lugar de fetch
      const response = await axios.get('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas/medico', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCitas(response.data);
    } catch (err) {
      console.error("Error al cargar agenda:", err);
      setError('Error al cargar la agenda de pacientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) cargarAgenda();
    // eslint-disable-next-line
  }, [currentUser]);

  // Función para cambiar el estado de la cita (PUT)
  const cambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Estás seguro de marcar esta cita como "${nuevoEstado}"?`)) return;

    try {
      setLoading(true);
      let recetaUrl = null;

      // Si es Atendida y hay un archivo, usamos la API de Cloudinary
      if (nuevoEstado === 'Atendida' && archivoReceta) {
        // Preparamos el archivo para enviarlo
        const formData = new FormData();
        formData.append("file", archivoReceta);
        formData.append("upload_preset", "mediflow_docs"); // El nombre del preset Unsigned que creaste

        // Hacemos la petición directamente a los servidores de Cloudinary
        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/dgnuvrcqr/auto/upload`,
          formData
        );
        
        // Cloudinary nos devuelve una URL segura lista para usar
        recetaUrl = cloudRes.data.secure_url;
      }

      // Le avisamos a nuestro backend (que ya lo habíamos preparado para recibir recetaUrl)
      const token = await currentUser.getIdToken();
      await axios.put(`https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas/${id}/estado`, 
        { estado: nuevoEstado, recetaUrl: recetaUrl },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setArchivoReceta(null);
      cargarAgenda();
    } catch (err) {
      console.error(err);
      alert('Error al procesar la atención.');
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'Pendiente': return '#f39c12';
      case 'Atendida': return '#27ae60';
      case 'Cancelada': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/dashboard-medico" style={{ textDecoration: 'none', color: '#3498db' }}>
        ← Volver al Portal
      </Link>
      
      <h2 style={{ marginTop: '20px' }}>Mi Agenda de Pacientes 🩺</h2>

      <div className="auth-box" style={{ maxWidth: '100%', marginTop: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando agenda...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#e74c3c' }}>{error}</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Fecha y Hora</th>
                <th style={{ padding: '10px' }}>Paciente</th>
                <th style={{ padding: '10px' }}>Estado Actual</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Acciones Médicas</th>
              </tr>
            </thead>
            <tbody>
              {citas.length > 0 ? (
                citas.map((cita) => (
                  <tr key={cita.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      <strong>{cita.fecha}</strong> <br/>
                      <span style={{color: '#7f8c8d'}}>{cita.hora}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{cita.pacienteNombre}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        background: getEstadoColor(cita.estado), 
                        color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem'
                      }}>
                        {cita.estado}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {cita.estado === 'Pendiente' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                          
                          {/* NUEVO INPUT PARA EL ARCHIVO */}
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.png" 
                            onChange={(e) => setArchivoReceta(e.target.files[0])}
                            style={{ fontSize: '0.8rem', maxWidth: '180px' }}
                          />
                          
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => cambiarEstado(cita.id, 'Atendida')} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                              Atender
                            </button>
                            <button onClick={() => cambiarEstado(cita.id, 'Cancelada')} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ color: '#bdc3c7', fontSize: '0.9rem' }}>Atención finalizada</span>
                          {/* Si la cita tiene receta, mostramos el link para descargarla */}
                          {cita.recetaUrl && (
                            <a href={cita.recetaUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', fontSize: '0.85rem', marginTop: '5px' }}>
                              📄 Ver Receta
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
                    No tienes pacientes agendados por el momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PanelAtencion;