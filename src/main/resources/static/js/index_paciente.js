// js/index_paciente.js

document.getElementById('formAgendar').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('btnReservar');
    const msg = document.getElementById('mensajeReserva');

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Procesando...';

    const baseUrl = "http://localhost:8080";

    const nuevoPaciente = {
        nombrePaciente: document.getElementById('nombre').value,
        apellidoPaciente: document.getElementById('apellido').value, 
        emailPaciente: document.getElementById('email').value,
        telefonoPaciente: document.getElementById('telefono').value,
        fecha_registro: document.getElementById('fecha').value
    };

    try {
        //esto concatena la base con la ruta de tu API automáticamente
        const respuesta = await fetch(`${baseUrl}/api/pacientes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoPaciente)
        });

        if (respuesta.ok) {
            btn.innerHTML = '<span class="material-symbols-outlined">task_alt</span> ¡Cita Solicitada!';
            btn.classList.replace('from-primary', 'from-teal-600');
            btn.classList.replace('to-primary-container', 'to-teal-500');

            msg.textContent = "¡Registro exitoso! Ya puedes verlo en el panel de control.";
            msg.className = "text-sm font-bold text-center h-5 text-teal-600";

            this.reset(); 
        } else {
            const errorData = await respuesta.json();
            throw new Error(errorData.message || "Error al registrar");
        }

    } catch (error) {
        console.error("Error en el registro:", error);
        msg.textContent = "Error: " + error.message;
        msg.className = "text-sm font-bold text-center h-5 text-red-600";
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Reserva <span class="material-symbols-outlined">check_circle</span>';
            btn.className = "w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2";
        }, 3000);
    }
});