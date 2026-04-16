// Pequeño script para manejar el formulario visualmente antes de que lo conectes a Spring Boot
document.getElementById('formAgendar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('btnReservar');
    const msg = document.getElementById('mensajeReserva');

    // 1. Efecto visual de carga
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Procesando...';

    // 2. Capturar los datos del formulario (Asegúrate de que los IDs coincidan con tu HTML)
    const datosCita = {
        paciente: { idPaciente: document.getElementById('id_paciente').value },
        dentista: { idUsuario: document.getElementById('id_dentista').value },
        servicio: { idServicio: document.getElementById('id_servicio').value },
        fechaHora: document.getElementById('fecha_hora').value, // Formato: "2026-04-15T16:00:00"
        notaCita: document.getElementById('notas').value,
        estadoCita: "Pendiente"
    };

    try {
    const response = await fetch('http://localhost:8080/api/citas/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCita)
    });

    // Si el servidor responde con error (ej: 400 o 500)
    if (!response.ok) {
        // Intentamos leer el mensaje de error del backend
        const errorData = await response.json(); 
        throw new Error(errorData.message || "No se pudo agendar la cita");
    }

    const data = await response.json();
    
    // ÉXITO
    msg.className = "text-green-500 font-bold mt-4 flex items-center gap-2 animate-bounce";
    msg.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ¡Cita agendada con éxito!';
    
    setTimeout(() => {
        this.reset();
        resetBoton();
    }, 3000);

} catch (error) {
    // ERROR DINÁMICO: Mostrará "Horario Ocupado" o el error que mande Spring
    console.error("Error:", error);
    msg.className = "text-red-500 font-bold mt-4 flex items-center gap-2";
    msg.innerHTML = `<span class="material-symbols-outlined">warning</span> ${error.message}`;
    resetBoton();
}
    function resetBoton() {
        btn.disabled = false;
        btn.innerHTML = 'Confirmar Reserva <span class="material-symbols-outlined">check_circle</span>';
        msg.textContent = "";
    }
});