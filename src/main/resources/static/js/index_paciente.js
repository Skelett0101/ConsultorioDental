
// --------------------Agendar Cita desde el Portal Público solo los datos de Paciente--------------------
const baseUrl = "http://localhost:8080";

document.addEventListener("DOMContentLoaded", () => {
    cargarServicios();
    // Limitar fecha mínima a hoy
    const hoy = new Date().toISOString().split("T")[0];
    document.getElementById('fechaCita').setAttribute('min', hoy);
});

// 1. Escuchar cuando cambian la fecha
document.getElementById('fechaCita').addEventListener('change', async (e) => {
    const fecha = e.target.value;
    const selectSlot = document.getElementById('slotDisponible');

    if (!fecha) return;

    selectSlot.disabled = true;
    selectSlot.innerHTML = '<option>Buscando disponibilidad...</option>';

    try {
        const response = await fetch(`${baseUrl}/api/disponibilidad/horariosDisponibles?fecha=${fecha}`);

        if (response.ok) {
            const slots = await response.json();
            selectSlot.innerHTML = '<option value="">Selecciona hora y doctor</option>';

            if (slots.length === 0) {
                selectSlot.innerHTML = '<option value="">Sin citas disponibles</option>';
            } else {
                slots.forEach(s => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({ idDen: s.idDentista, hora: s.hora });
                    option.textContent = `${s.hora} - con el Dr. ${s.nombreDentista}`;
                    selectSlot.appendChild(option);
                });
                selectSlot.disabled = false;
            }
        } else {
            selectSlot.innerHTML = `<option value="">Error del servidor: ${response.status}</option>`;
        }
    } catch (error) {
        selectSlot.innerHTML = '<option>Error de conexión</option>';
        console.error(error);
    }
});

// Confirmar la cita
document.getElementById('formAgendar').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('btnReservar');
    const msg = document.getElementById('mensajeReserva');

    // Validación básica
    const slotValue = document.getElementById('slotDisponible').value;
    if (!slotValue) {
        alert("Por favor elige un horario.");
        return;
    }

    const slotData = JSON.parse(slotValue);
    const fechaBase = document.getElementById('fechaCita').value;
    const idServicioSel = document.getElementById('servicioId').value;  

    btn.disabled = true;
    btn.innerHTML = 'Procesando...';

    const payloadPaciente = {
        nombrePaciente: document.getElementById('nombre').value,
        apellidoPaciente: document.getElementById('apellido').value,
        emailPaciente: document.getElementById('email').value,
        telefonoPaciente: document.getElementById('telefono').value
    };

    try {
        // --- REGISTRAR AL PACIENTE PRIMERO---
        const resPac = await fetch(`${baseUrl}/api/pacientes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadPaciente)
        });

        if (!resPac.ok) {
          
            const errorData = await resPac.json();

            // Mostrar que el correo ya existe
            msg.textContent = errorData.message;
            msg.className = "text-sm font-bold text-center text-red-600 animate-shake";

            // mandar alerta al usuario de que el correo ya existe
            btn.disabled = false;
            btn.innerHTML = 'Confirmar Reserva <span class="material-symbols-outlined">check_circle</span>';

            return; 
        }

        const paciente = await resPac.json();
        console.log("Paciente registrado con éxito:", paciente.idPaciente);

        // Guardar Cita ES LO SEGUNDO
        const payloadCita = {
            fechaHora: `${fechaBase}T${slotData.hora}:00`,
            notaCita: "Cita desde portal web",
            dentista: { idUsuario: slotData.idDen },
            paciente: { idPaciente: paciente.idPaciente },
            servicio: { idServicio: parseInt(idServicioSel) } // <--- Usamos el ID del select
        };

        const resCita = await fetch(`${baseUrl}/api/citas/registrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadCita)
        });

        if (resCita.ok) {
            msg.textContent = "¡Cita agendada! Revisa tu correo.";
            msg.className = "text-sm font-bold text-teal-600 animate-bounce";
            this.reset();
        }
    } catch (error) {
        msg.textContent = "Error al agendar.";
        msg.className = "text-sm font-bold text-red-600";
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Confirmar Reserva';
    }
});
// ------------------------------------FUNCION PARA CARFAR SERVICIOS EN EL SELECT---------------------------------------
async function cargarServicios() {
    const selectServicio = document.getElementById("servicioId"); // Revisa que el ID coincida
    if (!selectServicio) return;

    try {
        const response = await fetch("http://localhost:8080/api/servicios", { // Ajusta tu ruta

        });
        if (response.ok) {
            const servicios = await response.json();
            selectServicio.innerHTML = '<option value="">Seleccione un servicio</option>';
            servicios.forEach(s => {
                const option = document.createElement("option");
                option.value = s.idServicio;
                option.textContent = s.nombreServicio;
                selectServicio.appendChild(option);
            });
        }
    } catch (error) { console.error("Error cargando servicios:", error); }
}
