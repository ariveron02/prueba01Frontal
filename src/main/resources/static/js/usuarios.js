// usuarios.js - Con paginación en backend

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

// Variables de paginación
let paginaActual = 0;
let tamanioPagina = 10;
let totalPaginas = 0;
let totalElementos = 0;

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    setTimeout(() => alertDiv.remove(), 3000);
}

// ✅ CARGAR USUARIOS CON PAGINACIÓN (llama al backend)
async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios/paginated?page=${paginaActual}&size=${tamanioPagina}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        const data = await response.json();
        
        // Guardar datos de paginación
        totalPaginas = data.totalPaginas;
        totalElementos = data.totalElementos;
        
        // Actualizar tabla y controles
        actualizarTablaUsuarios(data.usuarios);
        actualizarEstadisticas();
        actualizarPaginacion();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar usuarios', 'danger');
    }
}

// Actualizar tabla de usuarios
function actualizarTablaUsuarios(usuarios) {
    const tbody = document.getElementById('tablaUsuarios');
    
    if (!tbody) return;
    
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            经营<td colspan="4" class="text-center">No hay usuarios registrados</td>
        `;
        return;
    }
    
    tbody.innerHTML = usuarios.map(usuario => `
        <tr data-id="${usuario.id}">
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.correo}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarUsuario(${usuario.id})">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarUsuario(${usuario.id})">
                    🗑️ Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalUsuarios = document.querySelector('#totalUsuarios');
    if (totalUsuarios) {
        totalUsuarios.textContent = totalElementos;
    }
}

// ✅ ACTUALIZAR CONTROLES DE PAGINACIÓN
function actualizarPaginacion() {
    const paginationContainer = document.querySelector('#paginationControls');
    if (!paginationContainer) return;
    
    if (totalPaginas <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '<ul class="pagination justify-content-center">';
    
    // Botón Anterior
    html += `<li class="page-item ${paginaActual === 0 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">« Anterior</a>
             </li>`;
    
    // Números de página (mostrar máximo 5)
    let inicio = Math.max(0, paginaActual - 2);
    let fin = Math.min(totalPaginas, inicio + 5);
    
    if (inicio > 0) {
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(0)">1</a></li>`;
        if (inicio > 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    
    for (let i = inicio; i < fin; i++) {
        html += `<li class="page-item ${paginaActual === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPagina(${i})">${i + 1}</a>
                 </li>`;
    }
    
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas - 1})">${totalPaginas}</a></li>`;
    }
    
    // Botón Siguiente
    html += `<li class="page-item ${paginaActual >= totalPaginas - 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Siguiente »</a>
             </li>`;
    
    html += '</ul>';
    
    // Información de página
    html += `<div class="text-center mt-2 text-muted">
                Mostrando ${Math.min((paginaActual + 1) * tamanioPagina, totalElementos)} de ${totalElementos} usuarios | 
                Página ${paginaActual + 1} de ${totalPaginas}
            </div>`;
    
    paginationContainer.innerHTML = html;
}

// ✅ CAMBIAR DE PÁGINA
function cambiarPagina(page) {
    if (page < 0 || page >= totalPaginas) return;
    paginaActual = page;
    cargarUsuarios();
}

// ✅ CAMBIAR CANTIDAD POR PÁGINA
function cambiarTamanioPagina() {
    tamanioPagina = parseInt(document.querySelector('#tamanioPagina').value);
    paginaActual = 0;
    cargarUsuarios();
}

// ========== CRUD ==========

async function crearUsuario(event) {
    event.preventDefault();
    
    const nombre = document.querySelector('#nombre').value;
    const correo = document.querySelector('#correo').value;
    const nuevoUsuario = { nombre, correo };
    
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });
        
        if (!response.ok) throw new Error('Error al crear usuario');
        
        mostrarMensaje('Usuario creado exitosamente', 'success');
        document.querySelector('#formUsuario').reset();
        cargarUsuarios();  // Recargar la página actual
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear usuario', 'danger');
    }
}

async function editarUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al obtener usuario');
        
        const usuario = await response.json();
        
        document.querySelector('#editId').value = usuario.id;
        document.querySelector('#editNombre').value = usuario.nombre;
        document.querySelector('#editCorreo').value = usuario.correo;
        
        const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
        modal.show();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al obtener usuario', 'danger');
    }
}

async function actualizarUsuario() {
    const id = document.querySelector('#editId').value;
    const nombre = document.querySelector('#editNombre').value;
    const correo = document.querySelector('#editCorreo').value;
    const usuarioActualizado = { nombre, correo };
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuarioActualizado)
        });
        
        if (!response.ok) throw new Error('Error al actualizar usuario');
        
        mostrarMensaje('Usuario actualizado exitosamente', 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
        modal.hide();
        
        cargarUsuarios();  // Recargar la página actual
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar usuario', 'danger');
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        if (!response.ok) throw new Error('Error al eliminar usuario');
        
        mostrarMensaje('Usuario eliminado exitosamente', 'success');
        cargarUsuarios();  // Recargar la página actual
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar usuario', 'danger');
    }
}

function buscarUsuarios() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    // Para búsqueda se puede implementar un endpoint específico
    // Por ahora, recargamos la página actual
    if (searchTerm === '') {
        cargarUsuarios();
    } else {
        // Búsqueda local (solo en los datos actuales)
        const rows = document.querySelectorAll('#tablaUsuarios tr');
        rows.forEach(row => {
            const nombre = row.cells[1]?.textContent.toLowerCase() || '';
            const correo = row.cells[2]?.textContent.toLowerCase() || '';
            const visible = nombre.includes(searchTerm) || correo.includes(searchTerm);
            row.style.display = visible ? '' : 'none';
        });
    }
}

// Cerrar modal
function cerrarModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
    if (modal) modal.hide();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    
    const form = document.querySelector('#formUsuario');
    if (form) {
        form.addEventListener('submit', crearUsuario);
    }
    
    const searchInput = document.querySelector('#searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', buscarUsuarios);
    }
    
    const tamanioSelect = document.querySelector('#tamanioPagina');
    if (tamanioSelect) {
        tamanioSelect.addEventListener('change', cambiarTamanioPagina);
    }
});