
document.addEventListener("DOMContentLoaded", () => {
    
    // Extraemos el usuario (la seguridad ya la verificó menu.js)
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 

    const usuario = JSON.parse(usuarioStr);
    


    // TODO: Aquí en el futuro puedes hacer un fetch a tu API 
    // para cargar las tarjetas de ingresos, número de pacientes, etc.
});