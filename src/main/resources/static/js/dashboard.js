// js/dashboard.js - Lógica exclusiva de la vista del Panel de Control

document.addEventListener("DOMContentLoaded", () => {
    
    // Extraemos el usuario 
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 

    const usuario = JSON.parse(usuarioStr);
    const esDentista = usuario.rol.toUpperCase() === "DENTISTA";
    
    // Saludo central del Dashboard
    const uiNombreSaludo = document.getElementById("uiNombreSaludo");
    if (uiNombreSaludo) {
        uiNombreSaludo.textContent = usuario.nombre;
    }

    // Ejecutar la carga de métricas dinámicas 
    cargarMetricasNuevosPacientes();

    //  Solo Admin y Recepcionista ven y calculan el dinero
    if (!esDentista) {
        cargarMetricasIngresos();
    } else {
        // Si es dentista, la tarjeta contenedora de ingresos y la ocultamos
        const uiIngresos = document.getElementById("uiDashboardIngresos");
        if (uiIngresos) {
            const tarjetaFinanzas = uiIngresos.closest('.bg-surface-container-lowest.lg\\:col-span-2');
            if (tarjetaFinanzas) tarjetaFinanzas.style.display = "none";
        }
    }
});

// Función para calcular los pacientes nuevos del mes y la meta
async function cargarMetricasNuevosPacientes() {
    try {
        const resp = await fetchConAuth('http://localhost:8080/api/pacientes?page=0&size=100');
        if (!resp.ok) throw new Error("Error al obtener pacientes");
        
        const data = await resp.json();
        const pacientes = data.content;
        
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        let nuevosEsteMes = 0;
        
        pacientes.forEach(p => {
            if (p.fechaCita) {
                const fecha = new Date(p.fechaCita);
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
                    nuevosEsteMes++;
                }
            }
        });
        
        const uiNuevos = document.getElementById("uiDashboardPacientesNuevos");
        if (uiNuevos) {
            uiNuevos.textContent = nuevosEsteMes;
        }
        
        const uiMeta = document.getElementById("uiDashboardPacientesMeta");
        if (uiMeta) {
            const metaObjetivo = 40;
            const porcentaje = Math.round((nuevosEsteMes / metaObjetivo) * 100);
            uiMeta.textContent = `${porcentaje}% de la meta mensual`;
            
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

//Sumar los ingresos del mes actual
async function cargarMetricasIngresos() {
    try {
        const resp = await fetchConAuth('http://localhost:8080/api/pagos/todos');
        if (!resp.ok) throw new Error("Error al obtener pagos");
        
        const pagos = await resp.json();
        
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        let sumaMensual = 0;
        
        // Recorremos todos los pagos buscando los de este mes y año
        pagos.forEach(pago => {
            const fString = pago.fecha_pago || pago.fechaPago;
            if (fString) {
                // Limpiamos la fecha por si viene con decimales desde Spring Boot
                const fecha = new Date(fString.split('.')[0].replace(' ', 'T'));
                
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
                    sumaMensual += parseFloat(pago.monto || 0);
                }
            }
        });
        
        // Pintamos el resultado en pantalla formateado como moneda
        const uiIngresos = document.getElementById("uiDashboardIngresos");
        if (uiIngresos) {
            uiIngresos.textContent = `$${sumaMensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
    } catch (error) {
        console.error("Error cargando ingresos del dashboard:", error);
        const uiIngresos = document.getElementById("uiDashboardIngresos");
        if (uiIngresos) uiIngresos.textContent = "$0.00";
    }
}