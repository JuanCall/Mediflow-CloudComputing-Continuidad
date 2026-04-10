import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PanelAtencion = () => {
    // DATOS DE PRUEBA: Para que la tabla nunca se vea vacía
    const [citas, setCitas] = useState([]); // <--- Empieza vacía
    const [loading, setLoading] = useState(true);

    const obtenerCitas = async () => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 
        if (!token) return;

        const res = await axios.get('http://localhost:5000/api/citas/medico', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // El servidor filtrará automáticamente por el UID del médico logueado
        setCitas(res.data);
        setLoading(false);
    } catch (error) {
        console.error("Error al obtener citas reales:", error);
        setLoading(false);
    }
    };

    useEffect(() => {
        obtenerCitas();
    }, []);

    const marcarAtendida = async (id) => {
        // Simulación de éxito para que el botón "funcione" visualmente
        alert("Cita atendida con éxito (Simulación)");
        setCitas(citas.map(c => c.id === id ? { ...c, estado: 'Atendida' } : c));
    };

    return (
        <div className="card shadow p-4 border-0">
            <h3 className="mb-4 text-primary">Pacientes por Atender</h3>
            <table className="table table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Paciente</th>
                        <th>Teléfono</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {citas.map(cita => (
                        <tr key={cita.id}>
                            <td><strong>{cita.pacienteNombre}</strong></td>
                            <td>{cita.pacienteTelefono}</td>
                            <td>{cita.fecha}</td>
                            <td>{cita.hora}</td>
                            <td>
                                <span className={`badge ${cita.estado === 'Atendida' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {cita.estado}
                                </span>
                            </td>
                            <td>
                                {cita.estado !== 'Atendida' && (
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={() => marcarAtendida(cita.id)}
                                    >
                                        Atender
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PanelAtencion;