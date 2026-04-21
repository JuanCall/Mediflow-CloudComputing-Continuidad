import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta si es necesario

export default function InventarioFarmacia() {
  const { currentUser } = useAuth();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario
  const [nuevoMed, setNuevoMed] = useState({
    nombre: '', descripcion: '', stockActual: '', stockMinimo: '', precio: ''
  });

  const API_URL = 'https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/medicamentos';

  // 1. Cargar medicamentos al iniciar
  useEffect(() => {
    fetchMedicamentos();
  }, []);

  const fetchMedicamentos = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setMedicamentos(data);
      }
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Crear un nuevo medicamento
  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoMed)
      });
      
      if (response.ok) {
        setNuevoMed({ nombre: '', descripcion: '', stockActual: '', stockMinimo: '', precio: '' });
        fetchMedicamentos(); // Recargar la tabla
        alert('Medicamento registrado con éxito');
      }
    } catch (error) {
      console.error("Error creando medicamento:", error);
    }
  };

  // 3. Eliminar medicamento
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este medicamento?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchMedicamentos(); // Recargar la tabla
      }
    } catch (error) {
      console.error("Error eliminando medicamento:", error);
    }
  };

  if (loading) return <p>Cargando inventario de farmacia...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>📦 Módulo de Farmacia e Inventario</h2>
      
      {/* Formulario de Ingreso */}
      <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Registrar Nuevo Medicamento</h3>
        <form onSubmit={handleCrear} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Nombre (Ej. Paracetamol)" required
            value={nuevoMed.nombre} onChange={(e) => setNuevoMed({...nuevoMed, nombre: e.target.value})} />
          <input type="text" placeholder="Descripción breve" 
            value={nuevoMed.descripcion} onChange={(e) => setNuevoMed({...nuevoMed, descripcion: e.target.value})} />
          <input type="number" placeholder="Stock Actual" required style={{ width: '100px' }}
            value={nuevoMed.stockActual} onChange={(e) => setNuevoMed({...nuevoMed, stockActual: e.target.value})} />
          <input type="number" placeholder="Stock Mínimo" required style={{ width: '100px' }}
            value={nuevoMed.stockMinimo} onChange={(e) => setNuevoMed({...nuevoMed, stockMinimo: e.target.value})} />
          <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
            ➕ Agregar
          </button>
        </form>
      </div>

      {/* Tabla de Inventario */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#343a40', color: 'white' }}>
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>Descripción</th>
            <th style={{ padding: '10px' }}>Stock</th>
            <th style={{ padding: '10px' }}>Estado</th>
            <th style={{ padding: '10px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((med) => (
            <tr key={med.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}><strong>{med.nombre}</strong></td>
              <td style={{ padding: '10px' }}>{med.descripcion}</td>
              <td style={{ padding: '10px' }}>{med.stockActual}</td>
              <td style={{ padding: '10px' }}>
                {med.stockActual <= med.stockMinimo ? 
                  <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Bajo Stock</span> : 
                  <span style={{ color: 'green' }}>✅ Óptimo</span>
                }
              </td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleEliminar(med.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
          {medicamentos.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No hay medicamentos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}