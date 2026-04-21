import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TablaCitas = () => {
    const { currentUser } = useAuth();
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ fecha: '', hora: '', medicoNombre: '', especialidad: '' });

    const cargarCitas = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.get('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas/paciente', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCitas(Array.isArray(res.data) ? res.data : []);
            setLoading(false);
        } catch (e) { 
            console.error("Error al cargar:", e);
            setLoading(false); 
        }
    };

    useEffect(() => { 
        if (currentUser) cargarCitas(); 
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await currentUser.getIdToken();
            const datosCita = {
                ...form,
                medicoId: "6JzNmkq5xAPIbSAhhmwVbF2X9Ki1", // TU ID REAL
                pacienteNombre: currentUser.displayName || "Junior Rios",
                estado: 'Pendiente'
            };

            await axios.post('https://mediflow-cloudcomputing-continuidad-production.up.railway.app/api/citas/paciente', datosCita, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Cita reservada con éxito ✅");
            setForm({ fecha: '', hora: '', medicoNombre: '', especialidad: '' });
            cargarCitas(); // Esto recarga la tabla de abajo
        } catch (err) {
            alert("Error al guardar la cita ❌");
        }
    };

    if (loading) return <div className="text-center p-5">Cargando citas...</div>;

    return (
        <div className="container mt-4">
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-header bg-primary text-white py-3">
                    <h5 className="mb-0">➕ Reservar Nueva Cita</h5>
                </div>
                <div className="card-body p-4 bg-light">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Fecha</label>
                                <input type="date" className="form-control" value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Hora</label>
                                <input type="time" className="form-control" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Médico</label>
                                <input type="text" className="form-control" placeholder="Nombre del Dr." value={form.medicoNombre} onChange={e => setForm({...form, medicoNombre: e.target.value})} required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold">Especialidad</label>
                                <select className="form-select" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} required>
                                    <option value="">Seleccione...</option>
                                    <option value="Cardiología">Cardiología</option>
                                    <option value="Pediatría">Pediatría</option>
                                    <option value="Medicina General">Medicina General</option>
                                </select>
                            </div>
                            <div className="col-12 mt-4 text-center">
                                <button type="submit" className="btn btn-success px-5 shadow-sm">Guardar Cita</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-secondary">
                            <tr>
                                <th className="px-4">Fecha</th>
                                <th>Hora</th>
                                <th>Médico</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.length > 0 ? citas.map((c, i) => (
                                <tr key={i}>
                                    <td className="px-4 fw-bold">{c.fecha}</td>
                                    <td>{c.hora}</td>
                                    <td>{c.medicoNombre}</td>
                                    <td><span className="badge bg-warning">{c.estado}</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center p-4">No tienes citas.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TablaCitas;