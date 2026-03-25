// proyectos.js - Gestión de proyectos

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

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
        const response = await fetch(`${API_URL}/proyectos`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        if (!response.ok) throw new Error('Error al cargar proyectos');
        const proyectos = await response.json();
        actualizarTablaProyectos(proyectos);
        actualizarEstadisticas(proyectos);
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar proyectos', 'danger');
    }
}

function actualizarTablaProyectos(proyectos) {
    const tbody = document.querySelector('#tablaProyectos tbody');
    if (!tbody) return;
    
    if (proyectos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay proyectos registrados</td></tr>';
        return;
    }
    
    tbody.innerHTML = proyectos.map(proyecto => {
        const estado = getEstadoProyecto(proyecto.fechaInicio, proyecto.fechaFin);
        const estadoClass = estado === 'Activo' ? 'badge-activo' : 
                           estado === 'En Progreso' ? 'badge-en-progreso' : 'badge-finalizado';
        
        return `
            <tr data-id="${proyecto.id}">
                <td>${proyecto.id}</td>
                <td><strong>${proyecto.nombre}</strong></td>
                <td>${proyecto.descripcion || '-'}</td>
                <td>${proyecto.fechaInicio}</td>
                <td>${proyecto.fechaFin}</td>
                <td><span class="badge ${estadoClass}">${estado}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editarProyecto(${proyecto.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarProyecto(${proyecto.id})">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

function getEstadoProyecto(fechaInicio, fechaFin) {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    
    if (hoy < inicio) return 'Pendiente';
    if (hoy > fin) return 'Finalizado';
    return 'En Progreso';
}

function actualizarEstadisticas(proyectos) {
    const total = document.querySelector('#totalProyectos');
    const activos = document.querySelector('#proyectosActivos');
    
    if (total) total.textContent = proyectos.length;
    if (activos) {
        const enProgreso = proyectos.filter(p => getEstadoProyecto(p.fechaInicio, p.fechaFin) === 'En Progreso').length;
        activos.textContent = enProgreso;
    }
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
        
        document.querySelector('#modalEditar').style.display = 'block';
        
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
        cerrarModal();
        cargarProyectos();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar proyecto', 'danger');
    }
}

async function eliminarProyecto(id) {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán también sus hitos y actividades.')) return;
    
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
    const rows = document.querySelectorAll('#tablaProyectos tbody tr');
    
    rows.forEach(row => {
        const nombre = row.cells[1]?.textContent.toLowerCase() || '';
        const descripcion = row.cells[2]?.textContent.toLowerCase() || '';
        const visible = nombre.includes(searchTerm) || descripcion.includes(searchTerm);
        row.style.display = visible ? '' : 'none';
    });
}

function cerrarModal() {
    document.querySelector('#modalEditar').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProyectos();
    
    const form = document.querySelector('#formProyecto');
    if (form) form.addEventListener('submit', crearProyecto);
    
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) searchInput.addEventListener('input', buscarProyectos);
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
    
    window.addEventListener('click', (event) => {
        const modal = document.querySelector('#modalEditar');
        if (event.target === modal) cerrarModal();
    });
});