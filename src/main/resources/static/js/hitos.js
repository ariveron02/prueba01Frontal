// hitos.js - Gestión de hitos

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

let proyectosList = [];

function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

async function cargarHitos() {
    try {
        const [hitosResponse, proyectosResponse] = await Promise.all([
            fetch(`${API_URL}/hitos`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/proyectos`, { headers: { 'Authorization': `Basic ${auth}` } })
        ]);
        
        if (!hitosResponse.ok) throw new Error('Error al cargar hitos');
        
        const hitos = await hitosResponse.json();
        proyectosList = await proyectosResponse.json();
        
        actualizarListaHitos(hitos);
        actualizarSelectProyectos();
        actualizarEstadisticas(hitos);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar hitos', 'danger');
    }
}

function actualizarListaHitos(hitos) {
    const container = document.querySelector('#listaHitos');
    if (!container) return;
    
    if (hitos.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay hitos registrados</div>';
        return;
    }
    
    container.innerHTML = hitos.map(hito => {
        const proyecto = proyectosList.find(p => p.id === hito.proyectoId);
        const completado = new Date(hito.fechaFin) < new Date();
        
        return `
            <div class="hito-item ${completado ? 'completado' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4>${hito.nombre}</h4>
                        <p>${hito.descripcion || 'Sin descripción'}</p>
                        <small>📁 Proyecto: ${proyecto?.nombre || 'No asignado'}</small>
                        <div class="fechas">
                            <span>📅 Inicio: ${hito.fechaInicio}</span>
                            <span>🏁 Fin: ${hito.fechaFin}</span>
                        </div>
                    </div>
                    <div>
                        <button class="btn btn-warning btn-sm" onclick="editarHito(${hito.id})">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarHito(${hito.id})">🗑️</button>
                    </div>
                </div>
                <div class="progreso-bar">
                    <div class="progreso-fill" style="width: ${calcularProgreso(hito.fechaInicio, hito.fechaFin)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function calcularProgreso(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();
    
    if (hoy < inicio) return 0;
    if (hoy > fin) return 100;
    
    const total = fin - inicio;
    const transcurrido = hoy - inicio;
    return Math.round((transcurrido / total) * 100);
}

function actualizarSelectProyectos() {
    const select = document.querySelector('#proyectoId');
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar proyecto</option>' +
        proyectosList.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
}

function actualizarEstadisticas(hitos) {
    const total = document.querySelector('#totalHitos');
    const completados = document.querySelector('#hitosCompletados');
    
    if (total) total.textContent = hitos.length;
    if (completados) {
        const completadosCount = hitos.filter(h => new Date(h.fechaFin) < new Date()).length;
        completados.textContent = completadosCount;
    }
}

async function crearHito(event) {
    event.preventDefault();
    
    const nuevoHito = {
        nombre: document.querySelector('#nombre').value,
        descripcion: document.querySelector('#descripcion').value,
        fechaInicio: document.querySelector('#fechaInicio').value,
        fechaFin: document.querySelector('#fechaFin').value,
        proyectoId: parseInt(document.querySelector('#proyectoId').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/hitos`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoHito)
        });
        
        if (!response.ok) throw new Error('Error al crear hito');
        
        mostrarMensaje('Hito creado exitosamente', 'success');
        document.querySelector('#formHito').reset();
        cargarHitos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear hito', 'danger');
    }
}

async function editarHito(id) {
    try {
        const response = await fetch(`${API_URL}/hitos/${id}`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        if (!response.ok) throw new Error('Error al obtener hito');
        
        const hito = await response.json();
        
        document.querySelector('#editId').value = hito.id;
        document.querySelector('#editNombre').value = hito.nombre;
        document.querySelector('#editDescripcion').value = hito.descripcion || '';
        document.querySelector('#editFechaInicio').value = hito.fechaInicio;
        document.querySelector('#editFechaFin').value = hito.fechaFin;
        
        const select = document.querySelector('#editProyectoId');
        select.innerHTML = proyectosList.map(p => 
            `<option value="${p.id}" ${p.id === hito.proyectoId ? 'selected' : ''}>${p.nombre}</option>`
        ).join('');
        
        document.querySelector('#modalEditar').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al obtener hito', 'danger');
    }
}

async function actualizarHito() {
    const id = document.querySelector('#editId').value;
    const hitoActualizado = {
        nombre: document.querySelector('#editNombre').value,
        descripcion: document.querySelector('#editDescripcion').value,
        fechaInicio: document.querySelector('#editFechaInicio').value,
        fechaFin: document.querySelector('#editFechaFin').value,
        proyectoId: parseInt(document.querySelector('#editProyectoId').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/hitos/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hitoActualizado)
        });
        
        if (!response.ok) throw new Error('Error al actualizar hito');
        
        mostrarMensaje('Hito actualizado exitosamente', 'success');
        cerrarModal();
        cargarHitos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar hito', 'danger');
    }
}

async function eliminarHito(id) {
    if (!confirm('¿Estás seguro de eliminar este hito?')) return;
    
    try {
        const response = await fetch(`${API_URL}/hitos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar hito');
        
        mostrarMensaje('Hito eliminado exitosamente', 'success');
        cargarHitos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar hito', 'danger');
    }
}

function cerrarModal() {
    document.querySelector('#modalEditar').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarHitos();
    
    const form = document.querySelector('#formHito');
    if (form) form.addEventListener('submit', crearHito);
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
    
    window.addEventListener('click', (event) => {
        const modal = document.querySelector('#modalEditar');
        if (event.target === modal) cerrarModal();
    });
});