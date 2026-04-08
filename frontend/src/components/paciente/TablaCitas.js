import React, { useState, useEffect } from 'react';

const TablaCitas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ fecha: '', hora: '', medico: '', especialidad: '' });

    const cargarCitas = async () => {
        try {
            const res = await fetch('/api/citas/paciente');
            const data = await res.json();
            setCitas(data);
            setLoading(false);
        } catch (e) { setLoading(false); }
    };

    useEffect(() => { cargarCitas(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch('/api/citas/paciente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        setForm({ fecha: '', hora: '', medico: '', especialidad: '' });
        cargarCitas();
    };

    if (loading) return <div className="text-center p-5">Cargando citas...</div>;

    return (
        <div className="container mt-4">
            {/* --- SECCIÓN DE FORMULARIO (ORDENADO EN TARJETA) --- */}
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
                                <input type="text" className="form-control" placeholder="Nombre del Dr." value={form.medico} onChange={e => setForm({...form, medico: e.target.value})} required />
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
                            <div className="col-12 mt-4">
                                <button type="submit" className="btn btn-success px-5 shadow-sm">
                                    Guardar Cita
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- TABLA DE CITAS (ORDENADA CON ESPACIOS) --- */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0 text-primary fw-bold">Mis Citas Programadas</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-secondary">
                            <tr>
                                <th className="px-4">Fecha</th>
                                <th>Hora</th>
                                <th>Médico</th>
                                <th>Especialidad</th>
                                <th className="text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((c, i) => (
                                <tr key={i}>
                                    <td className="px-4 fw-bold">{c.fecha}</td>
                                    <td>{c.hora}</td>
                                    <td>{c.medico}</td>
                                    <td>{c.especialidad}</td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill ${c.estado === 'Pendiente' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                            {c.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TablaCitas;