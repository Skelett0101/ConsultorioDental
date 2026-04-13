// Archivo: js/utils.js

/**
 * Función global para hacer peticiones a la API inyectando el Token de seguridad.
 * @param {string} url - El endpoint a consumir (ej. "http://localhost:8080/api/pacientes")
 * @param {object} opciones - Objeto con el método (GET, POST), body y headers extra.
 * @returns {Promise} - Retorna la promesa del fetch.
 */
async function fetchConAuth(url, opciones = {}) {
    const tokenActivo = localStorage.getItem("token") || localStorage.getItem("jwt");
    
    const headers = {
        "Content-Type": "application/json",
        ...opciones.headers,
    };

    // 2. Usamos la variable que sí definimos arriba
    if (tokenActivo) {
        headers["Authorization"] = `Bearer ${tokenActivo}`;
    }

    const response = await fetch(url, { ...opciones, headers });
    
    if (response.status === 401 || response.status === 403) {
        console.warn("Sesión expirada o inválida. Redirigiendo...");
        window.location.href = 'login.html';
    }
    
    return response;
}

// Cargar datos del usuario logueado en el header
async function inicializarUsuario() {
    const tokenActivo = localStorage.getItem("token") || localStorage.getItem("jwt");
    
    if (!tokenActivo) {
        console.log("No se encontró token, redirigiendo a login.");
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/usuarios/perfil', {
            headers: { 'Authorization': `Bearer ${tokenActivo}` }
        });

        if (response.ok) {
            const user = await response.json();
            if(document.getElementById('uiNombreNav')) 
                document.getElementById('uiNombreNav').innerText = `${user.nombre} ${user.apellido}`;
            if(document.getElementById('uiRolNav')) 
                document.getElementById('uiRolNav').innerText = user.rol?.nombre || "Usuario";
        }
    } catch (error) {
        console.error("Error de sesión:", error);
    }
}

async function realizarPago(datosPago) {
    const response = await fetchConAuth('http://localhost:8080/pagos', {
        method: 'POST',
        body: JSON.stringify(datosPago)
    });

    if (response.ok) {
        alert("¡Pago registrado con éxito!");
        if (typeof cargarMetricasFinancieras === 'function') cargarMetricasFinancieras();
    } else {
        const mensaje = await response.text();
        alert("Error al procesar pago: " + mensaje);
    }
}

function logout() {
    // Por seguridad, borramos ambos para que no quede rastro
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Ejecutar al cargar cualquier página que use este script
document.addEventListener('DOMContentLoaded', inicializarUsuario);