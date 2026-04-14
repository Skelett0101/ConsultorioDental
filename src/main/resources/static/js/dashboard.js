// js/dashboard.js - Lógica exclusiva de la vista del Panel de Control

document.addEventListener("DOMContentLoaded", () => {
    
    // Extraemos el usuario (la seguridad ya la verificó menu.js)
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 

    const usuario = JSON.parse(usuarioStr);
    
    // Saludo central del Dashboard
    const uiNombreSaludo = document.getElementById("uiNombreSaludo");
    if (uiNombreSaludo) {
        uiNombreSaludo.textContent = usuario.nombre;
    }

    // TODO: Aquí en el futuro puedes hacer un fetch a tu API 
    // para cargar las tarjetas de ingresos, número de pacientes, etc.
});