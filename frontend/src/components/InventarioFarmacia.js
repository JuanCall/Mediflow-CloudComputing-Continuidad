import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; 

export default function InventarioFarmacia() {
  const { currentUser } = useAuth();
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para crear nuevo medicamento
  const [nuevoMed, setNuevoMed] = useState({
    nombre: '', descripcion: '', stockActual: '', stockMinimo: '', precio: ''
  });

  // Estados para el Punto de Despacho (Carrito)
  const [carrito, setCarrito] = useState([]);
  const [medSeleccionado, setMedSeleccionado] = useState('');
  const [cantidadDespacho, setCantidadDespacho] = useState(1);

  const API_URL = 'https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/medicamentos';

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

  // --- FUNCIONES DE INVENTARIO (CRUD) ---
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
        fetchMedicamentos();
        alert('Medicamento registrado con éxito');
      }
    } catch (error) {
      console.error("Error creando medicamento:", error);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este medicamento?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) fetchMedicamentos();
    } catch (error) {
      console.error("Error eliminando medicamento:", error);
    }
  };

  // --- REABASTECER STOCK EXISTENTE ---
  const handleReabastecer = async (id, nombre, stockActual) => {
    const cantidadIngresada = window.prompt(`¿Cuántas unidades nuevas de ${nombre} acaban de llegar en este lote?`);
    
    // Validamos que el usuario haya ingresado un número válido
    if (!cantidadIngresada || isNaN(cantidadIngresada) || Number(cantidadIngresada) <= 0) {
      return; 
    }

    const nuevoStock = Number(stockActual) + Number(cantidadIngresada);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockActual: nuevoStock })
      });

      if (response.ok) {
        fetchMedicamentos(); // Recargamos la tabla para ver el nuevo stock
        alert(`✅ Lote ingresado. El nuevo stock de ${nombre} es de ${nuevoStock} unidades.`);
      } else {
        alert('❌ Error al actualizar el stock.');
      }
    } catch (error) {
      console.error("Error reabasteciendo medicamento:", error);
    }
  };

  // --- FUNCIONES DE DESPACHO (FARMACIA) ---
  const agregarAlCarrito = () => {
    if (!medSeleccionado || cantidadDespacho <= 0) return;
    
    const med = medicamentos.find(m => m.id === medSeleccionado);
    if (!med) return;

    // Validación visual rápida de stock
    if (med.stockActual < cantidadDespacho) {
      alert(`⚠️ Stock insuficiente. Solo quedan ${med.stockActual} de ${med.nombre}`);
      return;
    }

    // Verificar si ya está en el carrito para sumar la cantidad
    const existe = carrito.find(item => item.id === medSeleccionado);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === medSeleccionado 
          ? { ...item, cantidad: item.cantidad + Number(cantidadDespacho) } 
          : item
      ));
    } else {
      setCarrito([...carrito, { id: med.id, nombre: med.nombre, cantidad: Number(cantidadDespacho) }]);
    }

    setMedSeleccionado('');
    setCantidadDespacho(1);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const handleDespachar = async () => {
    if (carrito.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/despachar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicamentosEntregados: carrito,
          pacienteId: 'Venta Mostrador', // Por ahora lo dejamos genérico
          citaId: 'Venta Mostrador'
        })
      });

      if (response.ok) {
        alert('✅ ¡Despacho realizado con éxito! El stock ha sido actualizado.');
        setCarrito([]); // Limpiamos el carrito
        fetchMedicamentos(); // Recargamos el inventario para ver el nuevo stock
      } else {
        const errorData = await response.json();
        alert(`❌ Error al despachar: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error despachando:", error);
      alert("Error de conexión al despachar.");
    }
  };

  if (loading) return <p>Cargando módulo de farmacia...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🏥 Módulo de Farmacia e Inventario</h2>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* --- PANEL IZQUIERDO: PUNTO DE DESPACHO --- */}
        <div style={{ flex: '1', minWidth: '350px', background: '#e3f2fd', padding: '20px', borderRadius: '8px', border: '1px solid #90caf9' }}>
          <h3>🛒 Punto de Despacho</h3>
          <p style={{ fontSize: '14px', color: '#555' }}>Selecciona los medicamentos que indica la receta del paciente.</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select 
              value={medSeleccionado} 
              onChange={(e) => setMedSeleccionado(e.target.value)}
              style={{ flex: '1', padding: '8px' }}
            >
              <option value="">-- Seleccionar Medicamento --</option>
              {medicamentos.map(med => (
                <option key={med.id} value={med.id} disabled={med.stockActual <= 0}>
                  {med.nombre} (Stock: {med.stockActual})
                </option>
              ))}
            </select>
            <input 
              type="number" 
              min="1" 
              value={cantidadDespacho} 
              onChange={(e) => setCantidadDespacho(e.target.value)}
              style={{ width: '70px', padding: '8px' }}
            />
            <button onClick={agregarAlCarrito} style={{ background: '#0288d1', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
              Añadir
            </button>
          </div>

          {/* Lista del Carrito */}
          <ul style={{ listStyle: 'none', padding: 0, background: 'white', borderRadius: '4px', border: '1px solid #ccc' }}>
            {carrito.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span>{item.cantidad}x <strong>{item.nombre}</strong></span>
                <button onClick={() => quitarDelCarrito(item.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>X</button>
              </li>
            ))}
            {carrito.length === 0 && <li style={{ padding: '10px', textAlign: 'center', color: '#888' }}>El carrito está vacío</li>}
          </ul>

          <button 
            onClick={handleDespachar} 
            disabled={carrito.length === 0}
            style={{ width: '100%', background: carrito.length > 0 ? '#28a745' : '#ccc', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: carrito.length > 0 ? 'pointer' : 'not-allowed', marginTop: '10px' }}
          >
            ✅ Procesar Despacho
          </button>
        </div>

        {/* --- PANEL DERECHO: INGRESO AL INVENTARIO --- */}
        <div style={{ flex: '1', minWidth: '350px', background: '#f4f4f4', padding: '20px', borderRadius: '8px' }}>
          <h3>📦 Ingresar Nuevo Lote</h3>
          <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Nombre (Ej. Paracetamol)" required value={nuevoMed.nombre} onChange={(e) => setNuevoMed({...nuevoMed, nombre: e.target.value})} style={{ padding: '8px' }}/>
            <input type="text" placeholder="Descripción breve" value={nuevoMed.descripcion} onChange={(e) => setNuevoMed({...nuevoMed, descripcion: e.target.value})} style={{ padding: '8px' }}/>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Stock Inicial" required value={nuevoMed.stockActual} onChange={(e) => setNuevoMed({...nuevoMed, stockActual: e.target.value})} style={{ flex: '1', padding: '8px' }}/>
              <input type="number" placeholder="Stock Mínimo (Alerta)" required value={nuevoMed.stockMinimo} onChange={(e) => setNuevoMed({...nuevoMed, stockMinimo: e.target.value})} style={{ flex: '1', padding: '8px' }}/>
            </div>
            <button type="submit" style={{ background: '#343a40', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
              ➕ Guardar en Inventario
            </button>
          </form>
        </div>

      </div>

      {/* --- TABLA INFERIOR: VISUALIZACIÓN DEL INVENTARIO --- */}
      <h3 style={{ marginTop: '40px' }}>📊 Inventario General</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        <thead>
          <tr style={{ background: '#343a40', color: 'white' }}>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th style={{ padding: '12px' }}>Descripción</th>
            <th style={{ padding: '12px' }}>Stock Actual</th>
            <th style={{ padding: '12px' }}>Estado</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medicamentos.map((med) => (
            <tr key={med.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '12px' }}><strong>{med.nombre}</strong></td>
              <td style={{ padding: '12px' }}>{med.descripcion}</td>
              <td style={{ padding: '12px', fontSize: '1.1em', fontWeight: 'bold' }}>{med.stockActual}</td>
              <td style={{ padding: '12px' }}>
                {med.stockActual <= med.stockMinimo ? 
                  <span style={{ background: '#ffdddd', color: 'red', padding: '4px 8px', borderRadius: '12px', fontSize: '0.9em' }}>⚠️ Bajo Stock</span> : 
                  <span style={{ background: '#ddffdd', color: 'green', padding: '4px 8px', borderRadius: '12px', fontSize: '0.9em' }}>✅ Óptimo</span>
                }
              </td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => handleReabastecer(med.id, med.nombre, med.stockActual)} 
                  style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '8px' }}
                >
                  ➕ Ingresar Lote
                </button>
                <button 
                    onClick={() => handleEliminar(med.id)} 
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}