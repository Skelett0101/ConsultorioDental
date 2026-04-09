// js/menu.js - Lógica universal para el Sidebar y Topbar (Solo Modo Claro)

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. VALIDAR SEGURIDAD ---
    const usuarioStr = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (!usuarioStr || !token) {
        window.location.replace("index.html");
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    const rol = usuario.rol.toLowerCase();

    // --- 2. LLENAR DATOS DEL MENÚ ---
    const uiNombreNav = document.getElementById("uiNombreNav");
    const uiRolNav = document.getElementById("uiRolNav");
    
    if (uiNombreNav) uiNombreNav.textContent = `${usuario.nombre} ${usuario.apellido}`;
    if (uiRolNav) uiRolNav.textContent = usuario.rol;

    // --- 3. PERMISOS VISUALES (Ocultar "Personal" si no es admin) ---
    if (rol === "dentista" || rol === "recepcionista") {
        const navPersonal = document.getElementById("navPersonal");
        if (navPersonal) navPersonal.style.display = "none";
    }

    // --- 4. ILUMINACIÓN INTELIGENTE DEL MENÚ LATERAL (Estado Activo) ---
    // Obtenemos el nombre del archivo actual (ej. "calendario.html")
    const paginaActual = window.location.pathname.split("/").pop() || "dashboard.html";
    const enlacesMenu = document.querySelectorAll("aside nav a");

    enlacesMenu.forEach(enlace => {
        const destino = enlace.getAttribute("href");
        
        // Si el enlace coincide con la página actual, lo iluminamos de azul/blanco
        if (destino === paginaActual) {
            enlace.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-primary bg-white shadow-sm font-bold";
        } else {
            // Si no coincide, lo dejamos en gris con hover
            enlace.className = "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-slate-500 hover:bg-white/60 hover:text-slate-700 font-medium";
        }
    });

    // --- 5. MENÚ DESPLEGABLE DEL PERFIL ---
    const btnPerfil = document.getElementById("perfilDropdownBtn");
    const menuPerfil = document.getElementById("perfilMenu");

    if (btnPerfil && menuPerfil) {
        btnPerfil.addEventListener("click", (event) => {
            event.stopPropagation();
            menuPerfil.classList.toggle("hidden");
        });

        document.addEventListener("click", (event) => {
            if (!btnPerfil.contains(event.target)) {
                menuPerfil.classList.add("hidden");
            }
        });
    }
});

// --- 6. FUNCIÓN GLOBAL DE LOGOUT ---
window.logout = function() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("index.html");
};