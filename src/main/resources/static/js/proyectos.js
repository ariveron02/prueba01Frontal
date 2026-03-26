// proyectos.js - Gestión de proyectos con paginación

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

let paginaActual = 0;
let tamanioPagina = 10;
let totalPaginas = 0;
let totalElementos = 0;

function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

async function cargarProyectos() {
    try {
        const response = await fetch(`${API_URL}/proyectos/paginated?page=${paginaActual}&size=${tamanioPagina}`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al cargar proyectos');
        
        const data = await response.json();
        
        totalPaginas = data.totalPaginas;
        totalElementos = data.totalElementos;
        
        actualizarTablaProyectos(data.proyectos);
        actualizarEstadisticas();
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar proyectos', 'danger');
    }
}

function actualizarTablaProyectos(proyectos) {
    const tbody = document.getElementById('tablaProyectos');
    if (!tbody) return;
    
    if (!proyectos || proyectos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No hay proyectos registrados</td></tr>`;
        return;
    }
    
    const getEstado = (inicio, fin) => {
        const hoy = new Date();
        const inicioDate = new Date(inicio);
        const finDate = new Date(fin);
        if (hoy < inicioDate) return '<span class="badge bg-warning">Pendiente</span>';
        if (hoy > finDate) return '<span class="badge bg-secondary">Finalizado</span>';
        return '<span class="badge bg-success">Activo</span>';
    };
    
    tbody.innerHTML = proyectos.map(proyecto => `
        <tr data-id="${proyecto.id}">
            <td>${proyecto.id}</td>
            <td>${proyecto.nombre}</td>
            <td>${proyecto.descripcion || '-'}</td>
            <td>${proyecto.fechaInicio}</td>
            <td>${proyecto.fechaFin}</td>
            <td>${getEstado(proyecto.fechaInicio, proyecto.fechaFin)}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarProyecto(${proyecto.id})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProyecto(${proyecto.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function actualizarEstadisticas() {
    const total = document.querySelector('#totalProyectos');
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
    html += `<div class="text-center mt-2 text-muted">Mostrando ${Math.min((paginaActual + 1) * tamanioPagina, totalElementos)} de ${totalElementos} proyectos | Página ${paginaActual + 1} de ${totalPaginas}</div>`;
    
    container.innerHTML = html;
}

function cambiarPagina(page) {
    if (page < 0 || page >= totalPaginas) return;
    paginaActual = page;
    cargarProyectos();
}

function cambiarTamanioPagina() {
    tamanioPagina = parseInt(document.querySelector('#tamanioPagina').value);
    paginaActual = 0;
    cargarProyectos();
}

async function crearProyecto(event) {
    event.preventDefault();
    
    const nuevoProyecto = {
        nombre: document.querySelector('#nombre').value,
        descripcion: document.querySelector('#descripcion').value,
        fechaInicio: document.querySelector('#fechaInicio').value,
        fechaFin: document.querySelector('#fechaFin').value
    };
    
    try {
        const response = await fetch(`${API_URL}/proyectos`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoProyecto)
        });
        
        if (!response.ok) throw new Error('Error al crear proyecto');
        
        mostrarMensaje('Proyecto creado exitosamente', 'success');
        document.querySelector('#formProyecto').reset();
        cargarProyectos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear proyecto', 'danger');
    }
}

async function editarProyecto(id) {
    try {
        const response = await fetch(`${API_URL}/proyectos/${id}`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        if (!response.ok) throw new Error('Error al obtener proyecto');
        
        const proyecto = await response.json();
        
        document.querySelector('#editId').value = proyecto.id;
        document.querySelector('#editNombre').value = proyecto.nombre;
        document.querySelector('#editDescripcion').value = proyecto.descripcion || '';
        document.querySelector('#editFechaInicio').value = proyecto.fechaInicio;
        document.querySelector('#editFechaFin').value = proyecto.fechaFin;
        
        const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al obtener proyecto', 'danger');
    }
}

async function actualizarProyecto() {
    const id = document.querySelector('#editId').value;
    const proyectoActualizado = {
        nombre: document.querySelector('#editNombre').value,
        descripcion: document.querySelector('#editDescripcion').value,
        fechaInicio: document.querySelector('#editFechaInicio').value,
        fechaFin: document.querySelector('#editFechaFin').value
    };
    
    try {
        const response = await fetch(`${API_URL}/proyectos/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proyectoActualizado)
        });
        
        if (!response.ok) throw new Error('Error al actualizar proyecto');
        
        mostrarMensaje('Proyecto actualizado exitosamente', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
        modal.hide();
        cargarProyectos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar proyecto', 'danger');
    }
}

async function eliminarProyecto(id) {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return;
    
    try {
        const response = await fetch(`${API_URL}/proyectos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar proyecto');
        
        mostrarMensaje('Proyecto eliminado exitosamente', 'success');
        cargarProyectos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar proyecto', 'danger');
    }
}

function buscarProyectos() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tablaProyectos tr');
    rows.forEach(row => {
        const nombre = row.cells[1]?.textContent.toLowerCase() || '';
        row.style.display = nombre.includes(searchTerm) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProyectos();
    document.querySelector('#formProyecto')?.addEventListener('submit', crearProyecto);
    document.querySelector('#searchInput')?.addEventListener('input', buscarProyectos);
    document.querySelector('#tamanioPagina')?.addEventListener('change', cambiarTamanioPagina);
});