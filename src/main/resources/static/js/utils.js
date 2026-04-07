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