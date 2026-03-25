// usuarios.js - Gestión de usuarios

// Configuración
const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo}`;
    alertDiv.textContent = mensaje;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Función para cargar usuarios
async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar usuarios');
        
        const usuarios = await response.json();
        actualizarTablaUsuarios(usuarios);
        actualizarEstadisticas(usuarios);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar usuarios', 'danger');
    }
}

// Actualizar tabla de usuarios
function actualizarTablaUsuarios(usuarios) {
    // Busca el tbody por ID (es directo, sin "tbody" extra)
    const tbody = document.getElementById('tablaUsuarios');
    
    if (!tbody) {
        console.error('No se encontró el elemento con id "tablaUsuarios"');
        return;
    }
    
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = `
            经营
                <td colspan="4" class="text-center">No hay usuarios registrados</td>
            </tr>
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
function actualizarEstadisticas(usuarios) {
    const totalUsuarios = document.querySelector('#totalUsuarios');
    if (totalUsuarios) {
        totalUsuarios.textContent = usuarios.length;
    }
}

// Crear usuario
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
        cargarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al crear usuario', 'danger');
    }
}

// Editar usuario
async function editarUsuario(id) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Error al obtener usuario');
        
        const usuario = await response.json();
        
        // Llenar modal
        document.querySelector('#editId').value = usuario.id;
        document.querySelector('#editNombre').value = usuario.nombre;
        document.querySelector('#editCorreo').value = usuario.correo;
        
        // Mostrar modal
        document.querySelector('#modalEditar').style.display = 'block';
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al obtener usuario', 'danger');
    }
}

// Actualizar usuario
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
        cerrarModal();
        cargarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al actualizar usuario', 'danger');
    }
}

// Eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar usuario');
        
        mostrarMensaje('Usuario eliminado exitosamente', 'success');
        cargarUsuarios();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al eliminar usuario', 'danger');
    }
}

// Buscar usuarios
async function buscarUsuarios() {
    const searchTerm = document.querySelector('#searchInput').value.toLowerCase();
    
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });
        
        const usuarios = await response.json();
        
        const filtered = usuarios.filter(usuario => 
            usuario.nombre.toLowerCase().includes(searchTerm) ||
            usuario.correo.toLowerCase().includes(searchTerm)
        );
        
        actualizarTablaUsuarios(filtered);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cerrar modal
function cerrarModal() {
    document.querySelector('#modalEditar').style.display = 'none';
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
    
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', cerrarModal);
    }
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        const modal = document.querySelector('#modalEditar');
        if (event.target === modal) {
            cerrarModal();
        }
    });
});