// js/index_paciente.js
document.getElementById('formAgendar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('btnReservar');
    const msg = document.getElementById('mensajeReserva');

    // Bloquear botón y mostrar carga
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Procesando su solicitud...';

    const baseUrl = "http://localhost:8080";

    // 1. Datos del Paciente
    const datosPaciente = {
        nombrePaciente: document.getElementById('nombre').value,
        apellidoPaciente: document.getElementById('apellido').value,
        emailPaciente: document.getElementById('email').value,
        telefonoPaciente: document.getElementById('telefono').value
    };

    // 2. Datos base de la Cita
    const idServicio = document.getElementById('servicio').value;
    const fechaHora = document.getElementById('fecha').value;

    try {
        // --- PASO 1: REGISTRAR AL PACIENTE ---
        const resPaciente = await fetch(`${baseUrl}/api/pacientes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosPaciente)
        });

        if (!resPaciente.ok) {
            const errPac = await resPaciente.json();
            throw new Error(errPac.message || "Error al registrar sus datos personales.");
        }

        const pacienteCreado = await resPaciente.json();
        const idGenerado = pacienteCreado.idPaciente; // ID que nos devuelve Java

        // --- PASO 2: REGISTRAR LA CITA ---
        // Nota: Para citas públicas, solemos asignar un dentista por defecto (id: 1) 
        // o dejar que el sistema lo asigne después.
        const payloadCita = {
            fechaHora: fechaHora,
            notaCita: "Cita solicitada desde el portal web.",
            dentista: { idUsuario: 1 }, // Cambia este ID por un dentista de valor por defecto
            paciente: { idPaciente: idGenerado },
            servicio: { idServicio: parseInt(idServicio) }
        };

        const resCita = await fetch(`${baseUrl}/api/citas/registrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // IMPORTANTE: En el portal público no enviamos Token de Authorization 
            // a menos que el endpoint lo requiera. Asegúrate de que /registrar sea público en Java.
            body: JSON.stringify(payloadCita)
        });

        if (resCita.ok) {
            // --- ÉXITO TOTAL ---
            btn.innerHTML = '<span class="material-symbols-outlined">task_alt</span> ¡Cita Agendada!';
            btn.classList.replace('from-primary', 'from-teal-600');
            btn.classList.replace('to-primary-container', 'to-teal-500');

            msg.textContent = "¡Listo! Recibirás un correo de confirmación en breve.";
            msg.className = "text-sm font-bold text-center h-5 text-teal-600 animate-bounce";

            this.reset();
        } else {
            const errCita = await resCita.json();
            throw new Error(errCita.message || "Sus datos se guardaron, pero no pudimos agendar la cita.");
        }

    } catch (error) {
        console.error("Error en el proceso:", error);
        msg.textContent = error.message;
        msg.className = "text-sm font-bold text-center h-5 text-red-600";
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Reserva <span class="material-symbols-outlined">check_circle</span>';
            btn.className = "w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2";
            setTimeout(() => { msg.textContent = ""; }, 4000);
        }, 5000);
    }
});