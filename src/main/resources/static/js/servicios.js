document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Verificación de Sesión
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 
    const usuario = JSON.parse(usuarioStr); 
    const esAdmin = usuario.rol.toLowerCase() === 'admin';

    // 2. Referencias al HTML
    const contenedorServicios = document.getElementById("contenedor-servicios");
    const tablaPagos = document.getElementById("tabla-pagos");
    const inputBuscarPaciente = document.getElementById("input-buscar-paciente");
    const btnBuscarPaciente = document.getElementById("btn-buscar-paciente");
    const inputBusquedaServicio = document.getElementById("inputBusquedaServicio");
    const btnAdminNuevoServicio = document.getElementById("btn-admin-servicios");

    // --- MÓDULO DE SERVICIOS (R17 - R21) ---

    async function cargarServicios() {
        try {
            // Admin ve todos (activos/inactivos), otros solo activos
            const url = esAdmin 
                ? "http://localhost:8080/api/servicios/todos" 
                : "http://localhost:8080/api/servicios";
            
            const response = await fetchConAuth(url);
            if (!response.ok) throw new Error("Error al cargar servicios");
            
            const servicios = await response.json();
            renderizarCardsServicios(servicios);

            // Mostrar botón de creación solo a Admins
            if (esAdmin && btnAdminNuevoServicio) {
                btnAdminNuevoServicio.classList.remove("hidden");
                btnAdminNuevoServicio.onclick = () => prepararEdicion();
            }
        } catch (error) {
            console.error("Error:", error);
            contenedorServicios.innerHTML = `<p class="text-red-500">Error al cargar el catálogo.</p>`;
        }
    }

    function renderizarCardsServicios(servicios) {
        contenedorServicios.innerHTML = ""; 
        servicios.forEach(s => {
            const opacidad = s.activoServicio ? "" : "opacity-50 grayscale";
            const tarjeta = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all ${opacidad}">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                        <span class="material-symbols-outlined text-teal-700">medical_services</span>
                    </div>
                    ${esAdmin ? `
                        <div class="flex gap-2">
                            <button onclick="prepararEdicion(${s.idServicio}, '${s.nombreServicio}', ${s.precioServicio})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors">
                                <span class="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onclick="toggleServicio(${s.idServicio}, ${s.activoServicio})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-error transition-colors">
                                <span class="material-symbols-outlined text-sm">${s.activoServicio ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <h4 class="font-bold text-lg text-slate-800 mb-1">${s.nombreServicio}</h4>
                <div class="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                    <span class="text-2xl font-extrabold text-[#005d90]">$${s.precioServicio.toFixed(2)}</span>
                    ${!s.activoServicio ? '<span class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">INACTIVO</span>' : ''}
                </div>
            </div>`;
            contenedorServicios.innerHTML += tarjeta;
        });
    }

    // Funciones Globales para Admin (necesarias para los onclick del HTML dinámico)
    window.prepararEdicion = (id, nombre, precio) => {
        document.getElementById("modal-servicio-titulo").innerText = id ? "Editar Tratamiento" : "Nuevo Tratamiento";
        document.getElementById("input-servicio-id").value = id || "";
        document.getElementById("input-servicio-nombre").value = nombre || "";
        document.getElementById("input-servicio-precio").value = precio || "";
        document.getElementById("modal-servicio-gestion").classList.remove("hidden");
    };

    window.cerrarModalServicio = () => document.getElementById("modal-servicio-gestion").classList.add("hidden");

    window.toggleServicio = async (id, actualmenteActivo) => {
        const accion = actualmenteActivo ? "desactivar" : "activar";
        if (!confirm(`¿Deseas ${accion} este servicio?`)) return;

        const url = actualmenteActivo 
            ? `http://localhost:8080/api/servicios/${id}` 
            : `http://localhost:8080/api/servicios/${id}/activar`;
        const method = actualmenteActivo ? "DELETE" : "PATCH";

        try {
            const res = await fetchConAuth(url, { method });
            if (res.ok) cargarServicios();
        } catch (error) { console.error("Error al cambiar estado"); }
    };

    // Handler para Guardar/Editar Servicio
    document.getElementById("form-gestion-servicio").addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("input-servicio-id").value;
        const payload = {
            nombreServicio: document.getElementById("input-servicio-nombre").value,
            precioServicio: parseFloat(document.getElementById("input-servicio-precio").value),
            activoServicio: true
        };

        const url = id ? `http://localhost:8080/api/servicios/${id}` : `http://localhost:8080/api/servicios`;
        const method = id ? "PUT" : "POST";

        try {
            const res = await fetchConAuth(url, { method, body: JSON.stringify(payload) });
            if (res.ok) {
                cerrarModalServicio();
                cargarServicios();
            } else {
                alert("No se pudo guardar el servicio.");
            }
        } catch (error) { console.error(error); }
    });

    // Buscador de Servicios
    if (inputBusquedaServicio) {
        inputBusquedaServicio.addEventListener("input", async (e) => {
            const termino = e.target.value;
            if (termino.length > 2) {
                try {
                    const res = await fetchConAuth(`http://localhost:8080/api/servicios/buscar?nombre=${termino}`);
                    const data = await res.json();
                    renderizarCardsServicios(data);
                } catch (e) { console.error("Error buscando..."); }
            } else if (termino.length === 0) {
                cargarServicios();
            }
        });
    }


    // --- MÓDULO DE PAGOS ---

    async function cargarPagos(idPaciente = 1) {
        try {
            tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500">Buscando pagos...</td></tr>`;
            const response = await fetchConAuth(`http://localhost:8080/api/pagos/paciente/${idPaciente}`);
            
            if (!response.ok) throw new Error("Error al cargar pagos");
            
            const pagos = await response.json();
            tablaPagos.innerHTML = ""; 
            
            if (pagos.length === 0) {
                tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500">Sin pagos registrados.</td></tr>`;
                return;
            }

            pagos.forEach(pago => {
                const fecha = new Date(pago.fechaPago).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                const fila = `
                <tr class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4 text-sm font-bold text-slate-700">#TXN-${pago.idPago}</td>
                    <td class="px-6 py-4 text-sm text-slate-500 font-medium">${fecha}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#cde5ff] flex items-center justify-center text-[10px] font-bold text-[#005d90]">
                                P${pago.cita.paciente.idPaciente}
                            </div>
                            <span class="text-sm font-bold text-slate-800">Cita #${pago.cita.idCita}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 font-extrabold text-slate-800">$${pago.monto.toFixed(2)}</td>
                    <td class="px-6 py-4 text-right">
                        <span class="px-3 py-1 bg-[#8ef4e9]/30 text-[#006f67] text-[10px] font-bold uppercase tracking-wider rounded-md">${pago.metodoPago}</span>
                    </td>
                </tr>`;
                tablaPagos.innerHTML += fila;
            });
        } catch (error) {
            tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">No tienes permisos o error de conexión.</td></tr>`;
        }
    }

    btnBuscarPaciente.addEventListener("click", () => {
        const id = inputBuscarPaciente.value;
        if (id > 0) cargarPagos(id);
        else alert("ID no válido");
    });

    // Modal Registro de Pago
    const btnNuevaFactura = document.getElementById("btn-nueva-factura");
    const modalPago = document.getElementById("modal-pago");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const formPago = document.getElementById("form-pago");
    const selectMetodo = document.getElementById("select-metodo");
    const divDigitos = document.getElementById("div-digitos");

    btnNuevaFactura.addEventListener("click", () => modalPago.classList.remove("hidden"));
    btnCerrarModal.addEventListener("click", () => modalPago.classList.add("hidden"));

    selectMetodo.addEventListener("change", (e) => {
        divDigitos.classList.toggle("hidden", e.target.value !== "tarjeta");
        document.getElementById("input-digitos").required = (e.target.value === "tarjeta");
    });

    formPago.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        const payload = {
            cita: { idCita: parseInt(document.getElementById("input-cita").value) },
            monto: parseFloat(document.getElementById("input-monto").value),
            metodoPago: selectMetodo.value,
            usuarioRegistra: { idUsuario: usuario.idUsuario },
            ultimos4Digitos: selectMetodo.value === "tarjeta" ? document.getElementById("input-digitos").value : null,
            notas: document.getElementById("input-notas").value
        };

        try {
            const response = await fetchConAuth("http://localhost:8080/api/pagos", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert("¡Pago registrado!");
                modalPago.classList.add("hidden");
                formPago.reset();
                cargarPagos(inputBuscarPaciente.value || 1);
            } else {
                const txt = await response.text();
                throw new Error(txt);
            }
        } catch (err) { alert("Error: " + err.message); }
    });

    // Verificar Cita
    const btnVerificarCita = document.getElementById("btn-verificar-cita");
    if (btnVerificarCita) {
        btnVerificarCita.addEventListener("click", async () => {
            const idCita = prompt("Ingresa el ID de la Cita:");
            if (!idCita || isNaN(idCita)) return; 
            try {
                const response = await fetchConAuth(`http://localhost:8080/api/pagos/cita/${idCita}`);
                if (response.status === 404) alert("⚠️ Cita NO PAGADA.");
                else if (response.ok) {
                    const pago = await response.json();
                    alert(`✅ PAGADA\nMonto: $${pago.monto.toFixed(2)}\nCobró: ${pago.usuarioRegistra.nombre}`);
                }
            } catch (e) { alert("Error al verificar."); }
        });
    }

    // Inicialización
    cargarServicios();
    cargarPagos(1); 
});