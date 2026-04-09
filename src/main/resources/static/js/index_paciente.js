// Pequeño script para manejar el formulario visualmente antes de que lo conectes a Spring Boot
document.getElementById('formAgendar').addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = document.getElementById('btnReservar');
    const msg = document.getElementById('mensajeReserva');

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Procesando...';

    // Simulación de envío a tu API
    setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined">task_alt</span> ¡Cita Solicitada!';
        btn.classList.replace('from-primary', 'from-teal-600');
        btn.classList.replace('to-primary-container', 'to-teal-500');
        btn.classList.replace('shadow-primary/25', 'shadow-teal-500/25');

        msg.textContent = "Tu solicitud ha sido enviada con éxito. Te contactaremos pronto.";
        msg.classList.add("text-teal-600");

        // Limpiar el formulario después de 3 segundos
        setTimeout(() => {
            this.reset();
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Reserva <span class="material-symbols-outlined">check_circle</span>';
            btn.className = "w-full bg-gradient-to-r from-primary to-primary-container text-white py-4 rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2";
            msg.textContent = "";
        }, 4000);
    }, 1500);
});