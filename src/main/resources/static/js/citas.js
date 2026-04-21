const API_BASE = "http://localhost:8080/api/citas";

document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlayCita");
    const btnAbrir = document.getElementById("MostrarFormCitas");
    const btnsCerrar = document.querySelectorAll(".btn-close");
    const formCita = document.getElementById("formAgendarCita");

    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        // Saludo 
        if (document.getElementById("uiNombreSaludo")) {
            document.getElementById("uiNombreSaludo").textContent = usuario.nombre;
        }
        // Restricción de botón para Dentista
        if (usuario.rol.toUpperCase() === "DENTISTA") {
            const btnNuevoP = document.getElementById("btnNuevoPaciente");
            if (btnNuevoP) btnNuevoP.style.display = "none";
        }
    }

    // 3. ---------------------- METODOS DE ABRIR y CERRAR FORMULARIO--------------------------
    if (btnAbrir && overlay) {
        btnAbrir.addEventListener("click", () => {
            overlay.classList.remove("hidden");
            overlay.classList.add("flex");
            if (formCita) formCita.reset();
            // Inicializar el contador al cargar
            cargarPacientes();
            cargarServicios();
            cargarDentistas();
        });
    }

    btnsCerrar.forEach(btn => {
        btn.addEventListener("click", () => {
            overlay.classList.add("hidden");
            overlay.classList.remove("flex");
        });
    });

    // -------------------------------- METODO DE GUARDAR  -------------------------------------------

    if (formCita) {
        formCita.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");

            // 1. Capturamos los valores
            const idPac = document.getElementById("pacienteId").value;
            const idDen = document.getElementById("dentistaId").value;
            const idSer = document.getElementById("servicioId").value;
            const fHora = document.getElementById("fechaHora").value;
            const nota = document.getElementById("notas").value;

            // Si falta algo se muestra la alerta y no se envia nada
            if (!idPac || !idDen || !idSer || !fHora) {
                alert("Por favor, completa todos los campos obligatorios.");
                return;
            }

            //  ----------------VARIABLES PARA LA PETICION POST DESDE LAS CLASERS-----------
            const payload = {
                fechaHora: fHora,
                notaCita: nota,
                dentista: {
                    idUsuario: parseInt(idDen)
                },
                paciente: {
                    idPaciente: parseInt(idPac)
                },
                servicio: {
                    idServicio: parseInt(idSer)
                }
            };

            console.log("Enviando cita...", payload);

            try {
                const response = await fetch(`${API_BASE}/registrar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("¡Cita agendada con exito!");
                    overlay.classList.add("hidden");
                    formCita.reset();
                    renderizarCitasHoy();
                    if (typeof actualizarContadorCitas === 'function') actualizarContadorCitas();
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || "No se pudo agendar");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error de conexión con el servidor");
            }
        });
    }

    actualizarContadorCitas();
    renderizarCitasHoy();
    mostrarHorariosDentistas();
});

// ------------------------------------FUNCION PARA CARFAR SERVICIOS EN EL SELECT---------------------------------------
async function cargarServicios() {
    const selectServicio = document.getElementById("servicioId"); // Revisa que el ID coincida
    if (!selectServicio) return;
    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8080/api/servicios", { // Ajusta tu ruta
            headers: { 'Authorization': `Bearer ${token}` }
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

// ------------------------------ FUNCION PARA MOSTRAR PACIENTES EN EL SELECT---------------------
async function cargarPacientes() {
    const selectPaciente = document.getElementById("pacienteId");
    if (!selectPaciente) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8080/api/pacientes", {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();

            // 1. IMPORTANTE: Limpiar el select y dejar solo la opción por defecto
            selectPaciente.innerHTML = '<option value="">Seleccione paciente</option>';

            const listaPacientes = data.content || data;

            listaPacientes.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.idPaciente;
                option.textContent = `${paciente.nombrePaciente} ${paciente.apellidoPaciente}`;
                selectPaciente.appendChild(option);
            });

        }
    } catch (error) {
        console.error("Error al cargar pacientes:", error);
    }
}


// ------------------------------ FUNCIÓN PARA mostrar dentistas en el select -------------------------------------
async function cargarDentistas() {
    const selectDentista = document.getElementById("dentistaId");
    if (!selectDentista) return;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch("http://localhost:8080/api/usuarios", {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const listaUsuarios = data.content || data;

            // 1. Limpiamos el select
            selectDentista.innerHTML = '<option value="">Seleccione dentista</option>';

            const soloDentistas = listaUsuarios.filter(u => {
                return u.rol && u.rol.idRol === 2;
            });

            // 3. Llenamos el select con los filtrados
            soloDentistas.forEach(dentista => {
                const option = document.createElement("option");
                option.value = dentista.idUsuario;
                option.textContent = `Dr. ${dentista.nombre} ${dentista.apellido}`;
                selectDentista.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar dentistas:", error);
    }
}

// ------------------------------------FUNCIÓN PARA ACTUALIZAR CONTADOR DE CITAS EN EL DASHBOARD----------------------------------
async function actualizarContadorCitas() {
    const uiCitasHoy = document.getElementById("uiCitasHoy");
    if (!uiCitasHoy) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE}/hoy`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const citas = await response.json();
            uiCitasHoy.textContent = citas.length;
        }
    } catch (error) {
        console.error("Error al actualizar contador:", error);
    }
}

// ------------------------------------FUNCIÓN PARA ACTUALIZAR CONTADOR DE CITAS EN EL DASHBOARD2 id----------------------------------
async function actualizarContadorCitas() {
    const uiCitasHoy2 = document.getElementById("uiCitasHoy2");
    if (!uiCitasHoy2) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE}/hoy`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const citas = await response.json();
            uiCitasHoy2.textContent = citas.length;
        }
    } catch (error) {
        console.error("Error al actualizar contador:", error);
    }
}


// ------------------------------------FUNCIÓN PARA ACTUALIZAR CONTADOR DE CITAS 7 DIAS DESPUES----------------------------------
async function actualizarContadorCitas() {
    const uiCitasHoy2 = document.getElementById("uiCitasHoy2");
    if (!uiCitasHoy2) return;

    const token = localStorage.getItem("token");
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE}/hoy`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const citas = await response.json();
            uiCitasHoy2.textContent = citas.length;
        }
    } catch (error) {
        console.error("Error al actualizar contador:", error);
    }
}


// ------------------------------------FUNCIÓN PARA MOSTRAR LOS HORARIOS DE LOS DOSTORES----------------------------------
async function mostrarHorariosDentistas() {
    const contenedor = document.getElementById("tablaHorariosBody") || document.getElementById("horariosDentistas");
    if (!contenedor) return;

    const usuarioStr = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");
    if (!usuarioStr || !token) return;

    const usuarioLogueado = JSON.parse(usuarioStr);
    const idDelDentista = usuarioLogueado.idUsuario;
    const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/disponibilidad/mia?idDentista=${idDelDentista}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const horarios = await response.json();

            if (horarios.length === 0) {
                contenedor.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-xs text-slate-400">No hay turnos registrados.</td></tr>';
                return;
            }

            contenedor.innerHTML = "";

            horarios.forEach(h => {
                const horaI = h.horaInicio.substring(0, 5);
                const horaF = h.horaFin.substring(0, 5);
                const fila = `
                    <tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                        <td class="py-3 text-xs font-bold text-slate-700">Dr. ${h.dentista?.apellido || 'Dentista'}</td>
                        <td class="py-3 text-[10px] text-primary uppercase font-medium">${diasSemana[h.diaSemana] || 'S/D'}</td>
                        <td class="py-3 text-[10px] font-mono text-slate-500">${horaI} - ${horaF}</td>
                    </tr>`;
                contenedor.innerHTML += fila;
            });
        }
    } catch (error) {
        console.error("Error al cargar horarios:", error);
        contenedor.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-red-400 text-xs">Error de conexión</td></tr>';
    }
}
//------------------------------- FUNCIÓN PARA RENDERIZAR LAS CITAS DEL DIA EN EL DASHBOARD --------------------------------
async function renderizarCitasHoy() {
    const contenedor = document.getElementById("listaCitasHoy");
    if (!contenedor) return;
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE}/hoy`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const citas = await response.json();
            if (citas.length === 0) {
                contenedor.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No hay citas hoy.</p>';
                return;
            }
            contenedor.innerHTML = "";
            citas.forEach(cita => {
                const fecha = new Date(cita.fechaHora);
                const hora = fecha.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const ampm = fecha.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1];

                //formato de fecha 
                const fechaTexto = fecha.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                contenedor.innerHTML += `
                    <div class="bg-white p-4 rounded-xl flex items-center gap-4 border-l-4 border-primary shadow-sm mb-3">
                        <div class="w-14 text-center">
                            <p class="text-xs font-bold text-slate-700">${hora}</p>
                            <p class="text-[10px] text-slate-400 uppercase">${ampm}</p>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-sm text-slate-800">${cita.paciente?.nombrePaciente} ${cita.paciente?.apellidoPaciente}</h4>
                            <p class="text-xs text-slate-500">${cita.servicio?.nombreServicio} • Dr. ${cita.dentista?.apellido || 'Mendoza'}</p>
                            <p class="text-[10px] font-mono text-primary mt-1">${fechaTexto}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100">${cita.estadoCita || 'PENDIENTE'}</span>
                    </div>`;
            });
        }
    } catch (e) { console.error("Error render citas:", e); }
}