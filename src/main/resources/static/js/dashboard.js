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

    // Ejecutar la carga de métricas dinámicas
    cargarMetricasNuevosPacientes();
});

// Función para calcular los pacientes nuevos del mes y la meta
async function cargarMetricasNuevosPacientes() {
    try {
        // Pedimos una página con suficientes registros para asegurar que captamos los de este mes
        const resp = await fetchConAuth('http://localhost:8080/api/pacientes?page=0&size=100');
        if (!resp.ok) throw new Error("Error al obtener pacientes");
        
        const data = await resp.json();
        const pacientes = data.content;
        
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        let nuevosEsteMes = 0;
        
        // Contamos cuántos pacientes se registraron este mes
        pacientes.forEach(p => {
            if (p.fechaCita) {
                const fecha = new Date(p.fechaCita);
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
                    nuevosEsteMes++;
                }
            }
        });
        
        // pintar el número grande
        const uiNuevos = document.getElementById("uiDashboardPacientesNuevos");
        if (uiNuevos) {
            uiNuevos.textContent = nuevosEsteMes;
        }
        
        // calcular y pintar el porcentaje de la meta (Objetivo fijo: 40)
        const uiMeta = document.getElementById("uiDashboardPacientesMeta");
        if (uiMeta) {
            const metaObjetivo = 40;
            const porcentaje = Math.round((nuevosEsteMes / metaObjetivo) * 100);
            uiMeta.textContent = `${porcentaje}% de la meta mensual`;
            
            // si superan la meta, poner el texto verde
            if (porcentaje >= 100) {
                uiMeta.classList.remove("text-on-surface-variant");
                uiMeta.classList.add("text-[#006f67]", "font-bold");
            }
        }
        
    } catch (error) {
        console.error("Error cargando métricas del dashboard:", error);
        const uiNuevos = document.getElementById("uiDashboardPacientesNuevos");
        if (uiNuevos) uiNuevos.textContent = "-";
    }
}