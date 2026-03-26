// hitos.js - Gestión de hitos con paginación

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

let paginaActual = 0;
let tamanioPagina = 10;
let totalPaginas = 0;
let totalElementos = 0;
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
            fetch(`${API_URL}/hitos/paginated?page=${paginaActual}&size=${tamanioPagina}`, {
                headers: { 'Authorization': `Basic ${auth}` }
            }),
            fetch(`${API_URL}/proyectos`, { headers: { 'Authorization': `Basic ${auth}` } })
        ]);
        
        if (!hitosResponse.ok) throw new Error('Error al cargar hitos');
        
        const data = await hitosResponse.json();
        proyectosList = await proyectosResponse.json();
        
        totalPaginas = data.totalPaginas;
        totalElementos = data.totalElementos;
        
        actualizarListaHitos(data.hitos);
        actualizarEstadisticas();
        actualizarPaginacion();
        actualizarSelectProyectos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar hitos', 'danger');
    }
}

function actualizarListaHitos(hitos) {
    const container = document.querySelector('#listaHitos');
    if (!container) return;
    
    if (!hitos || hitos.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay hitos registrados</div>';
        return;
    }
    
    container.innerHTML = hitos.map(hito => {
        const proyecto = proyectosList.find(p => p.id === hito.proyectoId);
        const completado = new Date(hito.fechaFin) < new Date();
        
        return `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="card-title">${hito.nombre}</h5>
                            <p class="card-text">${hito.descripcion || 'Sin descripción'}</p>
                            <small class="text-muted">📁 Proyecto: ${proyecto?.nombre || 'No asignado'}</small>
                            <div class="small text-muted">📅 ${hito.fechaInicio} → ${hito.fechaFin}</div>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm" onclick="editarHito(${hito.id})">✏️</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarHito(${hito.id})">🗑️</button>
                        </div>
                    </div>
                    ${completado ? '<div class="mt-2"><span class="badge bg-success">Completado</span></div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function actualizarEstadisticas() {
    const total = document.querySelector('#totalHitos');
    if (total) total.textContent = totalElementos;
}

function actualizarPaginacion() {
    const container = document.querySelector('#paginationControls');
    if (!container) return;
    if (totalPaginas <= 1) { container.innerHTML = ''; return; }
    
    let html = '<ul class="pagination justify-content-center">';
    html += `<li class="page-item ${paginaActual === 0 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">« Anterior</a></li>`;
    
    let inicio = Math.max(0, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + 5);
    if (inicio > 0) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(0)">1</a></li>`;
        if (inicio > 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    for (let i = inicio; i < fin; i++) {
        html += `<li class="page-item ${paginaActual === i ? 'active' : ''}"><a class="page-link" href="#" onclick="cambiarPagina(${i})">${i + 1}</a></li>`;
    }
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas - 1})">${totalPaginas}</a></li>`;
    }
    html += `<li class="page-item ${paginaActual >= totalPaginas - 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Siguiente »</a></li>`;
    html += '</ul>';
    html += `<div class="text-center mt-2 text-muted">Mostrando ${Math.min((paginaActual + 1) * tamanioPagina, totalElementos)} de ${totalElementos} hitos | Página ${paginaActual + 1} de ${totalPaginas}</div>`;
    
    container.innerHTML = html;
}

function cambiarPagina(page) {
    if (page < 0 || page >= totalPaginas) return;
    paginaActual = page;
    cargarHitos();
}

function cambiarTamanioPagina() {
    tamanioPagina = parseInt(document.querySelector('#tamanioPagina').value);
    paginaActual = 0;
    cargarHitos();
}

function actualizarSelectProyectos() {
    const select = document.querySelector('#proyectoId');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccionar proyecto</option>' +
        proyectosList.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
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
        
        const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
        modal.show();
        
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
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
        modal.hide();
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

document.addEventListener('DOMContentLoaded', () => {
    cargarHitos();
    document.querySelector('#formHito')?.addEventListener('submit', crearHito);
    document.querySelector('#tamanioPagina')?.addEventListener('change', cambiarTamanioPagina);
});