const API_BASE = "http://localhost:8080/api/citas";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Elementos de la Interfaz
    const overlay = document.getElementById("overlayCita");
    const btnAbrir = document.getElementById("MostrarFormCitas");
    const btnsCerrar = document.querySelectorAll(".btn-close");
    const formCita = document.getElementById("formAgendarCita");

    // 2. Lógica de saludo y roles
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        // Saludo dinámico
        if (document.getElementById("uiNombreSaludo")) {
            document.getElementById("uiNombreSaludo").textContent = usuario.nombre;
        }
        // Restricción de botón para Dentista
        if (usuario.rol.toUpperCase() === "DENTISTA") {
            const btnNuevoP = document.getElementById("btnNuevoPaciente");
            if (btnNuevoP) btnNuevoP.style.display = "none";
        }
    }

    // 3. --- MÉTODOS DE INTERFAZ (ABRIR/CERRAR) ---
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

    // --- METODO DE GUARDAR 

if (formCita) {
    formCita.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // 1. Capturamos los valores
        const idPac = document.getElementById("pacienteId").value;
        const idDen = document.getElementById("dentistaId").value;
        const idSer = document.getElementById("servicioId").value;
        const fHora = document.getElementById("fechaHora").value;
        const nota  = document.getElementById("notas").value;

        // 2. Validación simple: Si falta algo, no disparamos el fetch
        if (!idPac || !idDen || !idSer || !fHora) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        // 3. Estructura que coincide con tus clases Java (idPaciente, idUsuario, idServicio)
        const payload = {
            fechaHora: fHora,      // Coincide con tu variable en Cita.java
            notaCita: nota,        // Coincide con tu variable en Cita.java
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
                if (typeof actualizarContadorCitas === 'function') actualizarContadorCitas();
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.message || "No se pudo agendar"));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de conexión con el servidor");
        }
    });
}

    actualizarContadorCitas();
});

//FUNCION PARA CARFAR SERVICIOS EN EL SELECT
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



// FUNCIÓN PARA EL CONTADOR
async function actualizarContadorCitas() {
    const uiCitasHoy = document.getElementById("uiCitasHoy");
    if (!uiCitasHoy) return;
    
    const token = localStorage.getItem("token"); 

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

// FUNCIÓN PARA mostrar Pacientes en el select
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


// FUNCIÓN PARA mostrar dentistas en el select
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


async function actualizarContadorCitas() {
    const uiCitasHoy = document.getElementById("uiCitasHoy");
    if (!uiCitasHoy) return;
    
    const token = localStorage.getItem("token"); 

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