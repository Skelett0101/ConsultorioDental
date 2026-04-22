// Archivo: js/utils.js

/**
 * Función global para hacer peticiones a la API inyectando el Token de seguridad.
 * @param {string} url - El endpoint a consumir (ej. "http://localhost:8080/api/pacientes")
 * @param {object} opciones - Objeto con el método (GET, POST), body y headers extra.
 * @returns {Promise} - Retorna la promesa del fetch.
 */
async function fetchConAuth(url, opciones = {}) {
    const token = localStorage.getItem("token");
    
    // Headers base
    const headers = {
        "Content-Type": "application/json",
        ...opciones.headers,
    };

    // Si existe una sesión activa, inyectamos el JWT
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(url, { ...opciones, headers });
}


// ==========================================
// SISTEMA DE ALERTAS FLOTANTES UNIVERSAL
// ==========================================

// 1. Al cargar la página, creamos el contenedor de alertas si no existe
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
});

/**
 * Muestra una alerta profesional en pantalla
 * @param {string} mensaje - El texto a mostrar
 * @param {string} tipo - 'success' (verde), 'error' (rojo), o 'info' (azul)
 */
function mostrarAlerta(mensaje, tipo = 'info') {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Creamos la alerta
    const toast = document.createElement("div");
    toast.className = `toast-alert toast-${tipo}`;

    // Elegimos el icono de Google Material Symbols según el tipo
    let icono = 'info';
    if (tipo === 'success') icono = 'check_circle';
    if (tipo === 'error') icono = 'error';

    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon">${icono}</span>
        <div class="toast-message">${mensaje}</div>
    `;

    // Lo agregamos a la pantalla
    container.appendChild(toast);

    // Pequeño truco para que la animación de entrada funcione
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    // Lo desaparecemos automáticamente después de 4 segundos
    setTimeout(() => {
        toast.classList.remove("show");
        // Esperamos 400ms a que termine la animación de salida antes de borrar el HTML
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}