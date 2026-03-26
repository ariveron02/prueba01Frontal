// registros.js - Gestión de registros con paginación

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

let paginaActual = 0;
let tamanioPagina = 10;
let totalPaginas = 0;
let totalElementos = 0;
let actividadesList = [];
let usuariosList = [];

function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

async function cargarRegistros() {
    try {
        const [registrosResponse, actividadesResponse, usuariosResponse] = await Promise.all([
            fetch(`${API_URL}/registros/paginated?page=${paginaActual}&size=${tamanioPagina}`, {
                headers: { 'Authorization': `Basic ${auth}` }
            }),
            fetch(`${API_URL}/actividades`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/usuarios`, { headers: { 'Authorization': `Basic ${auth}` } })
        ]);
        
        if (!registrosResponse.ok) throw new Error('Error al cargar registros');
        
        const data = await registrosResponse.json();
        actividadesList = await actividadesResponse.json();
        usuariosList = await usuariosResponse.json();
        
        totalPaginas = data.totalPaginas;
        totalElementos = data.totalElementos;
        
        actualizarListaRegistros(data.registros);
        actualizarEstadisticas();
        actualizarPaginacion();
        actualizarSelects();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar registros', 'danger');
    }
}

function actualizarListaRegistros(registros) {
    const container = document.querySelector('#listaRegistros');
    if (!container) return;
    
    if (!registros || registros.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay registros de horas</div>';
        return;
    }
    
    let totalHoras = 0;
    
    container.innerHTML = registros.map(reg => {
        const actividad = actividadesList.find(a => a.id === reg.actividadId);
        const usuario = usuariosList.find(u => u.id === reg.usuarioId);
        totalHoras += reg.horasTrabajadas || 0;
        
        return `
            <div class="card mb-2">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="card-title">📋 ${actividad?.nombre || 'Actividad no encontrada'}</h6>
                            <p class="card-text mb-1">👤 ${usuario?.nombre || 'Usuario no encontrado'}</p>
                            <small class="text-muted">📅 ${reg.fechaRegistro}</small>
                        </div>
                        <div class="text-end">
                            <div class="h4 text-primary">${reg.horasTrabajadas} hrs</div>
                            <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${reg.id})">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    const totalHorasElement = document.querySelector('#totalHoras');
    if (totalHorasElement) totalHorasElement.textContent = totalHoras.toFixed(1);
}

function actualizarEstadisticas() {
    const total = document.querySelector('#totalRegistros');
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
    html += `<div class="text-center mt-2 text-muted">Mostrando ${Math.min((paginaActual + 1) * tamanioPagina, totalElementos)} de ${totalElementos} registros | Página ${paginaActual + 1} de ${totalPaginas}</div>`;
    
    container.innerHTML = html;
}

function cambiarPagina(page) {
    if (page < 0 || page >= totalPaginas) return;
    paginaActual = page;
    cargarRegistros();
}

function cambiarTamanioPagina() {
    tamanioPagina = parseInt(document.querySelector('#tamanioPagina').value);
    paginaActual = 0;
    cargarRegistros();
}

function actualizarSelects() {
    const actividadSelect = document.querySelector('#actividadId');
    const usuarioSelect = document.querySelector('#usuarioId');
    
    if (actividadSelect) {
        actividadSelect.innerHTML = '<option value="">Seleccionar actividad</option>' +
            actividadesList.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
    }
    if (usuarioSelect) {
        usuarioSelect.innerHTML = '<option value="">Seleccionar usuario</option>' +
            usuariosList.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');
    }
}

async function crearRegistro(event) {
    event.preventDefault();
    
    const nuevoRegistro = {
        horasTrabajadas: parseFloat(document.querySelector('#horasTrabajadas').value),
        fechaRegistro: document.querySelector('#fechaRegistro').value,
        actividadId: parseInt(document.querySelector('#actividadId').value),
        usuarioId: parseInt(document.querySelector('#usuarioId').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/registros`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoRegistro)
        });
        
        if (!response.ok) throw new Error('Error al crear registro');
        
        mostrarMensaje('Registro creado exitosamente', 'success');
        document.querySelector('#formRegistro').reset();
        cargarRegistros();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear registro', 'danger');
    }
}

async function eliminarRegistro(id) {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    
    try {
        const response = await fetch(`${API_URL}/registros/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar registro');
        
        mostrarMensaje('Registro eliminado exitosamente', 'success');
        cargarRegistros();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar registro', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarRegistros();
    document.querySelector('#formRegistro')?.addEventListener('submit', crearRegistro);
    document.querySelector('#tamanioPagina')?.addEventListener('change', cambiarTamanioPagina);
});