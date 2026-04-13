// js/dashboard.js - Lógica exclusiva de Dev 4 (Finanzas y Dashboard)

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Gestión del Saludo (Seguridad y UI)
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) {
        console.warn("No se encontró usuario en localStorage");
        return; 
    }

    const usuario = JSON.parse(usuarioStr);
    const uiNombreSaludo = document.getElementById("uiNombreSaludo");
    
    if (uiNombreSaludo) {
        uiNombreSaludo.textContent = usuario.nombre;
    }

    // 2. Cargar métricas financieras y de control (R50, R51)
    // Solo se ejecuta si estamos en la vista de dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        cargarMetricasDev4();
    }
});

/**
 * Carga los datos financieros y contadores desde los endpoints de Dev 4
 */
async function cargarMetricasDev4() {
    try {
        // Ejecución en paralelo para optimizar carga
        const [resMes, resDia, resHoy] = await Promise.all([
            fetchConAuth('http://localhost:8080/dashboard/ingresos-mes'),
            fetchConAuth('http://localhost:8080/dashboard/ingresos-dia'),
            fetchConAuth('http://localhost:8080/dashboard/hoy')
        ]);

        // Inyección de datos en las tarjetas del Dashboard
        // R51: Ingresos del Mes
        if (resMes.ok) {
            const montoMes = await resMes.json();
            const elMes = document.getElementById('uiIngresosMes');
            if (elMes) elMes.innerText = `$${montoMes.toLocaleString()}`;
        }

        // R50: Ingresos del Día
        if (resDia.ok) {
            const montoDia = await resDia.json();
            const elDia = document.getElementById('uiIngresosHoy');
            if (elDia) elDia.innerText = `$${montoDia.toLocaleString()}`;
        }

        // Contador de Citas de Hoy
        if (resHoy.ok) {
            const totalHoy = await resHoy.json();
            const elHoy = document.getElementById('uiCitasHoy');
            if (elHoy) elHoy.innerText = totalHoy;
        }

    } catch (error) {
        console.error("Error al conectar con los endpoints de finanzas:", error);
    }
}

/**
 * R55: Exportación de reportes PDF
 */
async function descargarReportePDF(tipo) {
    const url = tipo === 'citas' 
        ? 'http://localhost:8080/reportes/citas/pdf' 
        : 'http://localhost:8080/reportes/agenda-semanal/pdf';

    try {
        const response = await fetchConAuth(url);
        if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `reporte_${tipo}_${new Date().toISOString().slice(0,10)}.pdf`;
            a.click();
        } else {
            alert("No se pudo generar el reporte en este momento.");
        }
    } catch (error) {
        console.error("Error en la descarga del PDF:", error);
    }
}