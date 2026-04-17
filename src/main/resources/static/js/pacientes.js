// js/pacientes.js

const API_BASE = "http://localhost:8080/api/pacientes";
let paginaActual = 0;

document.addEventListener("DOMContentLoaded", () => {
    cargarPacientes(paginaActual);
    configurarBuscador();
    actualizarInfoUsuario(); 
});

async function cargarPacientes(page) {
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
    tbody.innerHTML = "";

    pacientes.forEach(p => {
        const apellido = p.apellidoPaciente || ""; 
        const iniciales = `${p.nombrePaciente.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
        
        // Formatear la fecha
        const fechaFormateada = p.fecha_cita 
            ? new Date(p.fecha_cita).toLocaleString('es-MX', { 
                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
              })
            : 'Sin fecha';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm font-bold font-mono text-slate-500">${p.id_paciente}</td>
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
                         <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-[#cde5ff] text-[#005d90] transition-colors">
                            <span class="material-symbols-outlined text-lg">calendar_month</span>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-200 text-slate-600 transition-colors">
                            <span class="material-symbols-outlined text-lg">edit</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

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
        const url = `${API_BASE}/buscar?nombre=${termino}&apellido=${termino}&page=0&size=5`;
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