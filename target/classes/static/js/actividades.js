// actividades.js - Gestión de actividades

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

let hitosList = [];
let usuariosList = [];

function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

async function cargarActividades() {
    try {
        const [actividadesResponse, hitosResponse, usuariosResponse] = await Promise.all([
            fetch(`${API_URL}/actividades`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/hitos`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/usuarios`, { headers: { 'Authorization': `Basic ${auth}` } })
        ]);
        
        if (!actividadesResponse.ok) throw new Error('Error al cargar actividades');
        
        const actividades = await actividadesResponse.json();
        hitosList = await hitosResponse.json();
        usuariosList = await usuariosResponse.json();
        
        actualizarListaActividades(actividades);
        actualizarSelects();
        actualizarEstadisticas(actividades);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar actividades', 'danger');
    }
}

function actualizarListaActividades(actividades) {
    const container = document.querySelector('#listaActividades');
    if (!container) return;
    
    if (actividades.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay actividades registradas</div>';
        return;
    }
    
    container.innerHTML = actividades.map(act => {
        const hito = hitosList.find(h => h.id === act.hitoId);
        const usuario = usuariosList.find(u => u.id === act.usuarioAsignadoId);
        
        return `
            <div class="actividad-card">
                <div class="actividad-header">
                    <strong>${act.nombre}</strong>
                    <button class="btn btn-danger btn-sm" onclick="eliminarActividad(${act.id})">🗑️</button>
                </div>
                <div class="actividad-body">
                    <p>${act.descripcion || 'Sin descripción'}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <div>
                            <span class="usuario-asignado">👤 ${usuario?.nombre || 'Sin asignar'}</span>
                            <span class="badge" style="background: #e0e0e0; margin-left: 0.5rem;">🎯 ${hito?.nombre || 'Sin hito'}</span>
                        </div>
                        <div class="fechas">
                            📅 ${act.fechaInicio} → ${act.fechaFin}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function actualizarSelects() {
    const hitoSelect = document.querySelector('#hitoId');
    const usuarioSelect = document.querySelector('#usuarioId');
    
    if (hitoSelect) {
        hitoSelect.innerHTML = '<option value="">Seleccionar hito</option>' +
            hitosList.map(h => `<option value="${h.id}">${h.nombre}</option>`).join('');
    }
    
    if (usuarioSelect) {
        usuarioSelect.innerHTML = '<option value="">Seleccionar usuario</option>' +
            usuariosList.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    }
}

function actualizarEstadisticas(actividades) {
    const total = document.querySelector('#totalActividades');
    if (total) total.textContent = actividades.length;
}

async function crearActividad(event) {
    event.preventDefault();
    
    const nuevaActividad = {
        nombre: document.querySelector('#nombre').value,
        descripcion: document.querySelector('#descripcion').value,
        fechaInicio: document.querySelector('#fechaInicio').value,
        fechaFin: document.querySelector('#fechaFin').value,
        hitoId: parseInt(document.querySelector('#hitoId').value),
        usuarioAsignadoId: parseInt(document.querySelector('#usuarioId').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/actividades`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaActividad)
        });
        
        if (!response.ok) throw new Error('Error al crear actividad');
        
        mostrarMensaje('Actividad creada exitosamente', 'success');
        document.querySelector('#formActividad').reset();
        cargarActividades();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear actividad', 'danger');
    }
}

async function eliminarActividad(id) {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;
    
    try {
        const response = await fetch(`${API_URL}/actividades/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar actividad');
        
        mostrarMensaje('Actividad eliminada exitosamente', 'success');
        cargarActividades();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar actividad', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarActividades();
    
    const form = document.querySelector('#formActividad');
    if (form) form.addEventListener('submit', crearActividad);
});