// js/pacientes.js

const API_BASE = "http://localhost:8080/api/pacientes";
let paginaActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes(paginaActual);
    configurarBuscador();
    actualizarInfoUsuario(); 
    configurarFormularioEdicion(); 

    // restriccion de roles para eagregar paciente
    const usuarioStr = localStorage.getItem("usuario");
    if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        //si es dentissta,  el botón de neuvo paciente se desaparece
        if (usuario.rol.toUpperCase() === "DENTISTA") {
            const btnNuevo = document.getElementById("btnNuevoPaciente");
            if (btnNuevo) btnNuevo.style.display = "none";
        }
    }
});
// --- LISTAR PACIENTES (R13) ---
async function cargarPacientes(page) {
    paginaActual = page;
    try {
        const resp = await fetchConAuth(`${API_BASE}?page=${page}&size=5`);
        if (!resp.ok) throw new Error("Error al obtener pacientes");
        
        const data = await resp.json();
        renderizarTabla(data.content);
        renderizarPaginacion(data);
    } catch (error) {
        console.error("Error cargando pacientes:", error);
    }
}

function renderizarTabla(pacientes) {
    const tbody = document.getElementById("tablaPacientes");
    if(!tbody) return;
    tbody.innerHTML = "";

    // Obtenemos el rol del usuario logueado
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

        // 1. Botón de Historial: Lo ven TODOS (Admin, Recepcionista, Dentista)
        let botonesHTML = `
            <button onclick="verHistorial(${p.idPaciente})" class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-[#cde5ff] text-[#005d90] transition-colors" title="Ver Historial">
                <span class="material-symbols-outlined text-lg">calendar_month</span>
            </button>
        `;

        // 2. Botón de Editar: Lo ven todos EXCEPTO el Dentista (R12)
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

        // Rellenar campos del modal
        document.getElementById('editIdPaciente').value = p.idPaciente;
        document.getElementById('editNombre').value = p.nombrePaciente;
        document.getElementById('editApellido').value = p.apellidoPaciente;
        document.getElementById('editTelefono').value = p.telefonoPaciente;
        document.getElementById('editEmail').value = p.emailPaciente;
        
        // Formatear fecha para el input datetime-local
        if (p.fechaCita) {
            document.getElementById('editFechaCita').value = p.fechaCita.substring(0, 16);
        }

        // Mostrar Modal
        document.getElementById('modalEditar').classList.remove('hidden');
    } catch (error) {
        alert("Error: " + error.message);
    }
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.add('hidden');
}

// --- R12: EDITAR PACIENTE (Guardar cambios) ---
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
                cargarPacientes(paginaActual); // Recarga la tabla en la página que estabas
            } else {
                const err = await res.json();
                alert("Error al actualizar: " + (err.message || "Error desconocido"));
            }
        } catch (error) {
            console.error("Error en el PUT:", error);
        }
    });
}

// --- BUSCADOR Y PAGINACIÓN (R14) ---
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

function actualizarInfoUsuario() {
    const nombreNav = document.getElementById("uiNombreNav");
    const rolNav = document.getElementById("uiRolNav");
    
    if(nombreNav) nombreNav.textContent = localStorage.getItem("nombre") || "Usuario";
    if(rolNav) rolNav.textContent = localStorage.getItem("rol") || "Personal";
}

// R16: Historial de citas (Próximo paso)
function verHistorial(id) {
    alert("Cargando historial de citas para el paciente #" + id + "...");
    // Aquí implementaremos la lógica del R16
}

//REGISTRO INTERNO

// 1. Escuchar el click en el botón azul (si existe en la pantalla)
const btnNuevo = document.getElementById("btnNuevoPaciente");
if (btnNuevo) {
    btnNuevo.addEventListener("click", () => {
        document.getElementById("formCrearPacienteInterno").reset(); // Limpiar formulario
        document.getElementById("modalCrear").classList.remove("hidden");
    });
}

// 2. Función para cerrar la ventana
window.cerrarModalCrear = function() {
    document.getElementById("modalCrear").classList.add("hidden");
};

// 3. Enviar los datos a Spring Boot
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
            // Usamos fetchConAuth aunque el endpoint sea público, es buena práctica enviarlo
            const res = await fetchConAuth(`${API_BASE}`, {
                method: 'POST',
                body: JSON.stringify(nuevoPaciente)
            });

            if (res.ok) {
                cerrarModalCrear();
                cargarPacientes(paginaActual); // Recargamos la tabla para ver al nuevo paciente
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