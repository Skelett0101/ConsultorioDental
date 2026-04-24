document.addEventListener("DOMContentLoaded", () => {
    const overlay = document.getElementById("overlayHorarios");
    const btnAbrir = document.getElementById("MostrarFormHorarios");
    const btnsCerrar = document.querySelectorAll("#overlayHorarios .close-btn, #overlayHorarios .btn-flat");
    const formHorarios = document.getElementById("formHorarios");
    const selectDentista = document.getElementById("dentistaIdHorario");

    //OCULTAR BOTONES DE ACCIÓN SI EL USUARIO ES DENTISTA
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);

        // Si el rol es DENTISTA, escondemos los botones de acción
        if (usuario.rol.toUpperCase() === "DENTISTA") {
            const btnCitas = document.getElementById("MostrarFormCitas");
            const btnHorarios = document.getElementById("MostrarFormHorarios");
            const btnNuevoP = document.getElementById("btnNuevoPaciente"); // Por si lo tienes ahí

            if (btnCitas) btnCitas.style.display = "none";
            if (btnHorarios) btnHorarios.style.display = "none";
            if (btnNuevoP) btnNuevoP.style.display = "none";
        }
    }

    // 1. ---------------------- MÉTODOS DE ABRIR y CERRAR FORMULARIO --------------------------
    if (btnAbrir && overlay) {
        btnAbrir.addEventListener("click", () => {
            overlay.classList.remove("hidden");
            overlay.classList.add("flex");
            if (formHorarios) formHorarios.reset();
            
            // Cargar la lista de dentistas al abrir el modal
            cargarDentistas();
        });
    }

    btnsCerrar.forEach(btn => {
        btn.addEventListener("click", () => {
            overlay.classList.add("hidden");
            overlay.classList.remove("flex");
        });
    });

    // 2. ---------------------- DETECTAR CAMBIO DE DENTISTA --------------------------
    if (selectDentista) {
        selectDentista.addEventListener("change", (e) => {
            const idUsuario = e.target.value;
            if (idUsuario) {
                cargarHorariosDeDoctor(idUsuario);
            }
        });
    }

    // 3. ---------------------- EVENTO SUBMIT (VALIDACIÓN Y ENVÍO) --------------------------
    if (formHorarios) {
        formHorarios.addEventListener("submit", async (e) => {
            e.preventDefault(); 

            const idDentista = document.getElementById("dentistaIdHorario").value;
            if (!idDentista) {
                alert("Por favor, seleccione un dentista.");
                return;
            }

            const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const listaDisponibilidad = [];

            // --- INICIO DE LA VALIDACIÓN (EXCEPCIÓN 08:00 - 19:00) ---
            for (const dia of dias) {
                const activo = document.querySelector(`input[name="activo_${dia}"]`).checked;
                
                if (activo) {
                    const horaInicio = document.querySelector(`input[name="ini_${dia}"]`).value;
                    const horaFin = document.querySelector(`input[name="fin_${dia}"]`).value;

                    const limiteInferior = "08:00";
                    const limiteSuperior = "19:00";

                    // Validar rango permitido
                    if (horaInicio < limiteInferior || horaInicio > limiteSuperior) {
                        alert(`Error en ${dia}: La hora de entrada debe estar entre las 08:00 y las 19:00.`);
                        return;
                    }

                    if (horaFin < limiteInferior || horaFin > limiteSuperior) {
                        alert(`Error en ${dia}: La hora de salida debe estar entre las 08:00 y las 19:00.`);
                        return;
                    }

                    // Validar lógica de horas
                    if (horaInicio >= horaFin) {
                        alert(`Error en ${dia}: La entrada debe ser anterior a la salida.`);
                        return;
                    }

                    listaDisponibilidad.push({
                        diaSemana: obtenerNumeroDia(dia),
                        horaInicio: horaInicio + ":00",
                        horaFin: horaFin + ":00",
                        activo: 1,
                        dentista: { idUsuario: parseInt(idDentista) }
                    });
                }
            }

            if (listaDisponibilidad.length === 0) {
                alert("Debe activar al menos un día.");
                return;
            }

            // Proceder con el envío masivo a la API
            enviarHorarios(listaDisponibilidad);
        });
    }
});

// ------------------------------ FUNCIONES GLOBALES -------------------------------------

function obtenerNumeroDia(dia) {
    const mapa = { "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6 };
    return mapa[dia];
}

async function enviarHorarios(datos) {
    const token = localStorage.getItem("token");
    try {
        for (const dispo of datos) {
            const response = await fetch("http://localhost:8080/api/disponibilidad/registroDispo", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dispo)
            });
            if (!response.ok) throw new Error(`Error al guardar el día ${dispo.diaSemana}`);
        }
        alert("¡Horarios actualizados correctamente!");
        const overlay = document.getElementById("overlayHorarios");
        overlay.classList.add("hidden");
        overlay.classList.remove("flex");
    } catch (error) {
        console.error(error);
        alert("Hubo un fallo al guardar los horarios: " + error.message);
    }
}

async function cargarDentistas() {
    const selectDentista = document.getElementById("dentistaIdHorario");
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

            selectDentista.innerHTML = '<option value="">Seleccione dentista</option>';

            const soloDentistas = listaUsuarios.filter(u => u.rol && u.rol.idRol === 2);

            soloDentistas.forEach(dentista => {
                const option = document.createElement("option");
                option.value = dentista.idUsuario;
                option.textContent = `${dentista.nombre} ${dentista.apellido}`;
                selectDentista.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error al cargar dentistas:", error);
    }
}

async function cargarHorariosDeDoctor(idUsuario) {
    const token = localStorage.getItem("token");
    const mapaDias = { 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado" };

    try {
        const response = await fetch(`http://localhost:8080/api/disponibilidad/mia?idDentista=${idUsuario}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const horarios = await response.json(); 
            
            horarios.forEach(h => {
                const nombreDia = mapaDias[h.diaSemana]; 
                
                if (nombreDia) {
                    const inputIni = document.querySelector(`input[name="ini_${nombreDia}"]`);
                    const inputFin = document.querySelector(`input[name="fin_${nombreDia}"]`);
                    const checkActivo = document.querySelector(`input[name="activo_${nombreDia}"]`);

                    if (inputIni && inputFin) {
                        inputIni.value = h.horaInicio.substring(0, 5); 
                        inputFin.value = h.horaFin.substring(0, 5);
                        
                        if (checkActivo) {
                            checkActivo.checked = (h.activo == 1);
                            toggleRow(checkActivo); 
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error al obtener horarios del doctor:", error);
    }
}

function toggleRow(checkbox) {
    const row = checkbox.closest('tr');
    const inputs = row.querySelectorAll('input[type="time"]');
    inputs.forEach(input => {
        input.disabled = !checkbox.checked;
        input.style.opacity = checkbox.checked ? "1" : "0.4";
    });
}