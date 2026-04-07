document.addEventListener("DOMContentLoaded", () => {
    const usuarioStr = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    // Si no hay token, lo regresamos al login
    if (!usuarioStr || !token) {
        window.location.replace("index.html");
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    document.getElementById("bienvenida").textContent = `👤 Sesión activa: ${usuario.nombre} | Rol actual: [${usuario.rol.toUpperCase()}]`;
});

const cajaResultado = document.getElementById("resultado");

// --- PRUEBA ADMIN ---
document.getElementById("btnAdmin").addEventListener("click", async () => {
    cajaResultado.textContent = "⏳ Probando...";
    try {
        // 🔥 QUITA LA DIAGONAL AL FINAL DE LA RUTA
        const res = await fetchConAuth("http://localhost:8080/api/usuarios", { method: "GET" });
        evaluarRespuesta(res, "¡Pase VIP de Admin concedido!");
    } catch (error) {
        cajaResultado.textContent = "Error de conexión con el backend.";
    }
});

// --- PRUEBA RECEPCIONISTA ---
document.getElementById("btnRecep").addEventListener("click", async () => {
    cajaResultado.textContent = "⏳ Probando...";
    try {
        const res = await fetchConAuth("http://localhost:8080/api/pacientes/crear", { 
            method: "POST",
            body: JSON.stringify({ test: "data" }) 
        });
        evaluarRespuesta(res, "¡Permiso concedido para crear pacientes!");
    } catch (error) {
        cajaResultado.textContent = "Error de conexión con el backend.";
    }
});

// --- PRUEBA DENTISTA ---
document.getElementById("btnDentista").addEventListener("click", async () => {
    cajaResultado.textContent = "⏳ Probando...";
    try {
        const res = await fetchConAuth("http://localhost:8080/api/citas/mis-citas", { method: "GET" });
        evaluarRespuesta(res, "¡Permiso de Dentista concedido!");
    } catch (error) {
        cajaResultado.textContent = "Error de conexión con el backend.";
    }
});

// --- EVALUADOR MAGICO ---
function evaluarRespuesta(response, mensajeExito) {
    if (response.ok || response.status === 404) {
        cajaResultado.style.color = "green";
        cajaResultado.textContent = `✅ ÉXITO: ${mensajeExito}\n\n(Status: ${response.status}. Si es 404, significa que el filtro de seguridad te dejó pasar, pero aún no has creado el controlador en Java. ¡Eso es bueno!)`;
    } else if (response.status === 403) {
        cajaResultado.style.color = "red";
        cajaResultado.textContent = `🚫 BLOQUEADO: Status 403 Forbidden.\n\nSpring Security hizo su trabajo. No tienes el rol necesario para esta ruta.`;
    } else {
        cajaResultado.style.color = "#d9534f";
        cajaResultado.textContent = `⚠️ STATUS RARO: ${response.status}. Revisa la consola de tu backend en Java.`;
    }
}

// --- LOGOUT ---
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.replace("index.html");
}