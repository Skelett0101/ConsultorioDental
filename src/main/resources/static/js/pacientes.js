// js/pacientes.js
const API_BASE2 = "http://localhost:8080/api/citas";
const API_BASE = "http://localhost:8080/api/pacientes";
let paginaActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes(paginaActual);
    configurarBuscador();
    configurarFormularioEdicion(); 

    // Restriccion de roles para agregar paciente
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        // Si es dentista, el botón de nuevo paciente desaparece
        if (usuario.rol.toUpperCase() === "DENTISTA") {
            const btnNuevo = document.getElementById("btnNuevoPaciente");
            if (btnNuevo) btnNuevo.style.display = "none";
        }
    }
        actualizarContadorSemanal();
});

// --- LISTAR PACIENTES Y ACTUALIZAR TARJETAS ---
async function cargarPacientes(page) {
    paginaActual = page;
    try {
        const resp = await fetchConAuth(`${API_BASE}?page=${page}&size=5`);
        if (!resp.ok) throw new Error("Error al obtener pacientes");
        
        const data = await resp.json();
        renderizarTabla(data.content);
        renderizarPaginacion(data);
        
        // Alimentar las tarjetas de arriba
        actualizarMetricas(data.totalElements, data.content);
    } catch (error) {
        console.error("Error cargando pacientes:", error);
        document.getElementById("uiTotalPacientes").textContent = "0";
        document.getElementById("uiPacientesNuevos").textContent = "0";
    }
}

// Lógica de las 2 Tarjetas
function actualizarMetricas(totalPacientes, pacientesActuales) {
    // Tarjeta 1: Total absoluto de la Base de Datos
    const uiTotal = document.getElementById("uiTotalPacientes");
    if (uiTotal) uiTotal.textContent = totalPacientes;

    // Tarjeta 2: Contar cuántos pacientes visibles son de este mes
    const uiNuevos = document.getElementById("uiPacientesNuevos");
    if (uiNuevos && pacientesActuales) {
        const mesActual = new Date().getMonth();
        const anioActual = new Date().getFullYear();
        let registradosEsteMes = 0;
        
        pacientesActuales.forEach(p => {
            if (p.fechaCita) {
                const fechaCita = new Date(p.fechaCita);
                if (fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === anioActual) {
                    registradosEsteMes++;
                }
            }
        });
        uiNuevos.textContent = registradosEsteMes;
    }
}

// ------------------------------------FUNCIÓN PARA CONTADOR SEMANAL----------------------------------
async function actualizarContadorSemanal() {
    const uiSemana = document.getElementById("uiCitasSemana");
    if (!uiSemana) return;

    const token = localStorage.getItem("token");

    try {
        // Ajustamos la URL a la que tienes en el Controller de Java
        const response = await fetch(`${API_BASE2}/contadorsemanas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const cantidad = await response.json();
            uiSemana.textContent = cantidad;
        }
    } catch (error) {
        console.error("Error al cargar contador semanal:", error);
    }
}

function renderizarTabla(pacientes) {
    const tbody = document.getElementById("tablaPacientes");
    if(!tbody) return;
    tbody.innerHTML = "";

    const usuarioStr = localStorage.getItem("usuario");
    const rolActual = usuarioStr ? JSON.parse(usuarioStr).rol.toUpperCase() : "";

    pacientes.forEach(p => {
        const apellido = p.apellidoPaciente || ""; 
        const iniciales = `${p.nombrePaciente.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
        
        const fechaFormateada = p.fechaCita 
            ? new Date(p.fechaCita).toLocaleString('es-MX', { 
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })
            : 'Sin fecha';

        let botonesHTML = `
            <button onclick="verHistorial(${p.idPaciente})" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-[#cde5ff] text-[#005d90] transition-colors" title="Ver Historial">
                <span class="material-symbols-outlined text-lg">calendar_month</span>
            </button>
        `;

        if (rolActual !== "DENTISTA") {
            botonesHTML += `
                <button onclick="abrirModalEditar(${p.idPaciente})" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors" title="Editar">
                    <span class="material-symbols-outlined text-lg">edit</span>
                </button>
            `;
        }

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm font-bold font-mono text-slate-500">${p.idPaciente}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#cde5ff] flex items-center justify-center text-[#005d90] font-bold text-sm">
                            ${iniciales}
                        </div>
                        <p class="font-bold text-slate-800">${p.nombrePaciente} ${apellido}</p>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">${p.emailPaciente}</td>
                <td class="px-6 py-4 text-sm text-slate-600">${p.telefonoPaciente}</td>
                <td class="px-6 py-4 text-sm text-slate-500 font-medium">${fechaFormateada}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        ${botonesHTML}
                    </div>
                </td>
            </tr>
        `;
    });
}

// --- R15: VER DETALLE (Cargar datos en Modal) ---
async function abrirModalEditar(id) {
    try {
        const resp = await fetchConAuth(`${API_BASE}/${id}`);
        if (!resp.ok) throw new Error("No se pudo cargar la información del paciente");
        
        const p = await resp.json();

        document.getElementById('editIdPaciente').value = p.idPaciente;
        document.getElementById('editNombre').value = p.nombrePaciente;
        document.getElementById('editApellido').value = p.apellidoPaciente;
        document.getElementById('editTelefono').value = p.telefonoPaciente;
        document.getElementById('editEmail').value = p.emailPaciente;
        
        if (p.fechaCita) {
            document.getElementById('editFechaCita').value = p.fechaCita.substring(0, 16);
        }

        document.getElementById('modalEditar').classList.remove('hidden');
    } catch (error) {
        alert("Error: " + error.message);
    }
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.add('hidden');
}

// --- R12: EDITAR PACIENTE ---
function configurarFormularioEdicion() {
    const form = document.getElementById('formEditarPaciente');
    if(!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editIdPaciente').value;
        
        const datosActualizados = {
            nombrePaciente: document.getElementById('editNombre').value,
            apellidoPaciente: document.getElementById('editApellido').value,
            telefonoPaciente: document.getElementById('editTelefono').value,
            emailPaciente: document.getElementById('editEmail').value,
            fechaCita: document.getElementById('editFechaCita').value
        };

        try {
            const res = await fetchConAuth(`${API_BASE}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(datosActualizados)
            });

            if (res.ok) {
                cerrarModalEditar();
                cargarPacientes(paginaActual); 
            } else {
                const err = await res.json();
                alert("Error al actualizar: " + (err.message || "Error desconocido"));
            }
        } catch (error) {
            console.error("Error en el PUT:", error);
        }
    });
}

// --- BUSCADOR Y PAGINACIÓN ---
function configurarBuscador() {
    const input = document.getElementById("inputBusqueda");
    if(!input) return;

    input.addEventListener("input", (e) => {
        const valor = e.target.value;
        if (valor.length > 2) {
            buscarPacientes(valor);
        } else if (valor.length === 0) {
            cargarPacientes(0);
        }
    });
}

async function buscarPacientes(termino) {
    try {
        const url = `${API_BASE}/buscar?nombre=${termino}&apellido=${termino}&email=${termino}&page=0&size=5`;
        const resp = await fetchConAuth(url);
        const data = await resp.json();
        renderizarTabla(data.content);
        renderizarPaginacion(data);
    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}

function renderizarPaginacion(data) {
    const container = document.getElementById("botonesPaginacion");
    if(!container) return;
    container.innerHTML = "";

    for (let i = 0; i < data.totalPages; i++) {
        const activo = i === data.number ? 'bg-[#005d90] text-white' : 'bg-white text-slate-600';
        container.innerHTML += `
            <button onclick="cargarPacientes(${i})" class="w-10 h-10 rounded-lg border border-slate-200 font-bold text-sm ${activo} transition-colors">
                ${i + 1}
            </button>
        `;
    }
}

//funcion ver historial de citas pasadas y futuras
async function verHistorial(id) {
    const modal = document.getElementById('modalHistorial');
    const tbody = document.getElementById('listaHistorialCitas');
    const lblNombre = document.getElementById('nombrePacienteHistorial');
    
    // 1. Mostrar estado de carga
    tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-400 animate-pulse">Consultando historial...</td></tr>`;
    modal.classList.remove('hidden');

    try {
        // 2. Obtener datos del paciente y todas las citas
        const [resPaciente, resCitas] = await Promise.all([
            fetchConAuth(`${API_BASE}/${id}`),
            fetchConAuth(`http://localhost:8080/api/citas/listar`)
        ]);

        if (!resPaciente.ok || !resCitas.ok) throw new Error("Error al obtener datos");

        const paciente = await resPaciente.json();
        const todasCitas = await resCitas.json();
        const usuarioActual = JSON.parse(localStorage.getItem("usuario"));

        lblNombre.textContent = `Paciente: ${paciente.nombrePaciente} ${paciente.apellidoPaciente}`;

        // 3. Filtrar historial según REQUISITO R16
        // - Admin/Recepcionista: Ven todo el historial de este paciente.
        // - Dentista: Solo ve las citas que ÉL mismo atendió a este paciente.
        const historialFiltrado = todasCitas.filter(cita => {
            const esMismoPaciente = (cita.paciente?.idPaciente || cita.paciente?.id_paciente) === id;
            
            if (usuarioActual.rol.toUpperCase() === "DENTISTA") {
                return esMismoPaciente && cita.dentista?.idUsuario === usuarioActual.idUsuario;
            }
            return esMismoPaciente;
        });

        // 4. Renderizar resultados
        if (historialFiltrado.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-slate-500 font-medium">No hay registros de citas para mostrar.</td></tr>`;
            return;
        }

        tbody.innerHTML = historialFiltrado.map(cita => {
            const fecha = new Date(cita.fechaHora).toLocaleString('es-MX', { 
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            const estadoColor = cita.estadoCita === "COMPLETADA" ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50";
            
            return `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-4 text-sm font-medium text-slate-700">${fecha}</td>
                    <td class="py-4 text-sm text-slate-600">${cita.servicio?.nombreServicio || 'Consulta'}</td>
                    <td class="py-4 text-sm text-slate-600">Dr. ${cita.dentista?.nombre || 'No asignado'}</td>
                    <td class="py-4">
                        <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${estadoColor}">
                            ${cita.estadoCita || 'PENDIENTE'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-red-500">Error al cargar el historial.</td></tr>`;
    }
}

function cerrarModalHistorial() {
    document.getElementById('modalHistorial').classList.add('hidden');
}

// --- REGISTRO INTERNO ---
const btnNuevo = document.getElementById("btnNuevoPaciente");
if (btnNuevo) {
    btnNuevo.addEventListener("click", () => {
        document.getElementById("formCrearPacienteInterno").reset(); 
        document.getElementById("modalCrear").classList.remove("hidden");
    });
}

window.cerrarModalCrear = function() {
    document.getElementById("modalCrear").classList.add("hidden");
};

const formCrear = document.getElementById("formCrearPacienteInterno");
if (formCrear) {
    formCrear.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const nuevoPaciente = {
            nombrePaciente: document.getElementById('crearNombre').value,
            apellidoPaciente: document.getElementById('crearApellido').value,
            telefonoPaciente: document.getElementById('crearTelefono').value,
            emailPaciente: document.getElementById('crearEmail').value,
            fechaCita: document.getElementById('crearFechaCita').value
        };

        try {
            const res = await fetchConAuth(`${API_BASE}`, {
                method: 'POST',
                body: JSON.stringify(nuevoPaciente)
            });

            if (res.ok) {
                cerrarModalCrear();
                cargarPacientes(0); 
                alert("Paciente registrado con éxito en el sistema.");
            } else {
                const err = await res.json();
                alert("Error: " + (err.message || "No se pudo registrar"));
            }
        } catch (error) {
            console.error("Error al registrar:", error);
        }
    });
}