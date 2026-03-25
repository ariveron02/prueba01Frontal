// registros.js - Gestión de registros de horas

const API_URL = 'http://localhost:8080';
const auth = btoa('admin:admin123');

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
            fetch(`${API_URL}/registros`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/actividades`, { headers: { 'Authorization': `Basic ${auth}` } }),
            fetch(`${API_URL}/usuarios`, { headers: { 'Authorization': `Basic ${auth}` } })
        ]);
        
        if (!registrosResponse.ok) throw new Error('Error al cargar registros');
        
        const registros = await registrosResponse.json();
        actividadesList = await actividadesResponse.json();
        usuariosList = await usuariosResponse.json();
        
        actualizarListaRegistros(registros);
        actualizarSelects();
        actualizarEstadisticas(registros);
        actualizarResumenSemanal(registros);
        
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar registros', 'danger');
    }
}

function actualizarListaRegistros(registros) {
    const container = document.querySelector('#listaRegistros');
    if (!container) return;
    
    if (registros.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay registros de horas</div>';
        return;
    }
    
    container.innerHTML = registros.map(reg => {
        const actividad = actividadesList.find(a => a.id === reg.actividadId);
        const usuario = usuariosList.find(u => u.id === reg.usuarioId);
        
        return `
            <div class="registro-item">
                <div class="registro-info">
                    <h4>${actividad?.nombre || 'Actividad no encontrada'}</h4>
                    <p>👤 ${usuario?.nombre || 'Usuario no encontrado'}</p>
                    <span class="fecha-registro">📅 ${reg.fechaRegistro}</span>
                </div>
                <div style="text-align: right;">
                    <div class="horas-trabajadas">${reg.horasTrabajadas} hrs</div>
                    <button class="btn btn-danger btn-sm" onclick="eliminarRegistro(${reg.id})">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
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

function actualizarEstadisticas(registros) {
    const total = document.querySelector('#totalRegistros');
    const totalHoras = document.querySelector('#totalHoras');
    
    if (total) total.textContent = registros.length;
    if (totalHoras) {
        const sumaHoras = registros.reduce((sum, r) => sum + (r.horasTrabajadas || 0), 0);
        totalHoras.textContent = sumaHoras.toFixed(1);
    }
}

function actualizarResumenSemanal(registros) {
    const container = document.querySelector('#resumenSemanal');
    if (!container) return;
    
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    
    const registrosSemana = registros.filter(r => {
        const fechaReg = new Date(r.fechaRegistro);
        return fechaReg >= inicioSemana && fechaReg <= hoy;
    });
    
    const horasPorDia = {};
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    registrosSemana.forEach(r => {
        const fecha = new Date(r.fechaRegistro);
        const dia = dias[fecha.getDay()];
        horasPorDia[dia] = (horasPorDia[dia] || 0) + (r.horasTrabajadas || 0);
    })};