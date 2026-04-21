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

    // --- MÓDULO DE SERVICIOS ---
    async function cargarServicios() {
        if(!contenedorServicios) return;
        try {
            const url = esAdmin ? "http://localhost:8080/api/servicios/todos" : "http://localhost:8080/api/servicios";
            const response = await fetchConAuth(url);
            if (!response.ok) throw new Error("Error al cargar servicios");
            
            const servicios = await response.json();
            renderizarCardsServicios(servicios);

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
            contenedorServicios.innerHTML += `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 transition-all ${opacidad}">
                <div class="flex justify-between items-start mb-4">
                    <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
                        <span class="material-symbols-outlined text-teal-700">medical_services</span>
                    </div>
                    ${esAdmin ? `
                        <div class="flex gap-2">
                            <button onclick="prepararEdicion(${s.idServicio}, '${s.nombreServicio}', ${s.precioServicio})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-primary transition-colors"><span class="material-symbols-outlined text-sm">edit</span></button>
                            <button onclick="toggleServicio(${s.idServicio}, ${s.activoServicio})" class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-error transition-colors"><span class="material-symbols-outlined text-sm">${s.activoServicio ? 'visibility_off' : 'visibility'}</span></button>
                        </div>
                    ` : ''}
                </div>
                <h4 class="font-bold text-lg text-slate-800 mb-1">${s.nombreServicio}</h4>
                <div class="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                    <span class="text-2xl font-extrabold text-[#005d90]">$${s.precioServicio.toFixed(2)}</span>
                    ${!s.activoServicio ? '<span class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">INACTIVO</span>' : ''}
                </div>
            </div>`;
        });
    }

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

        const url = actualmenteActivo ? `http://localhost:8080/api/servicios/${id}` : `http://localhost:8080/api/servicios/${id}/activar`;
        const method = actualmenteActivo ? "DELETE" : "PATCH";

        try {
            const res = await fetchConAuth(url, { method });
            if (res.ok) cargarServicios();
        } catch (error) { console.error("Error al cambiar estado"); }
    };

    const formGestionServicio = document.getElementById("form-gestion-servicio");
    if(formGestionServicio){
        formGestionServicio.addEventListener("submit", async (e) => {
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
                if (res.ok) { cerrarModalServicio(); cargarServicios(); } 
                else { alert("No se pudo guardar el servicio."); }
            } catch (error) { console.error(error); }
        });
    }

    if (inputBusquedaServicio) {
        inputBusquedaServicio.addEventListener("input", async (e) => {
            const termino = e.target.value;
            if (termino.length > 2) {
                try {
                    const res = await fetchConAuth(`http://localhost:8080/api/servicios/buscar?nombre=${termino}`);
                    renderizarCardsServicios(await res.json());
                } catch (e) { console.error("Error buscando..."); }
            } else if (termino.length === 0) {
                cargarServicios();
            }
        });
    }

    // --- MÓDULO DE PAGOS ---
    async function cargarPagos(busqueda = "") {
        if(!tablaPagos) return;
        try {
            tablaPagos.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-slate-500">Cargando historial...</td></tr>`;
            const response = await fetchConAuth(`http://localhost:8080/api/pagos/todos`);
            if (!response.ok) throw new Error("Error al cargar pagos");
            
            let pagos = await response.json();
            tablaPagos.innerHTML = ""; 
            
            if (busqueda.trim() !== "") {
                const termino = busqueda.toLowerCase().trim();
                pagos = pagos.filter(pago => {
                    const nombre = (pago.cita.paciente.nombre_paciente || pago.cita.paciente.nombrePaciente || "").toLowerCase();
                    const apellido = (pago.cita.paciente.apellido_paciente || pago.cita.paciente.apellidoPaciente || "").toLowerCase();
                    return `${nombre} ${apellido}`.includes(termino);
                });
            }

            if (pagos.length === 0) {
                tablaPagos.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-slate-500">No se encontraron pagos.</td></tr>`;
                return;
            }

            const pagosAgrupados = pagos.reduce((acc, pago) => {
                const idPac = pago.cita.paciente.id_paciente || pago.cita.paciente.idPaciente;
                if (!acc[idPac]) {
                    const nombre = pago.cita.paciente.nombre_paciente || pago.cita.paciente.nombrePaciente || 'Paciente';
                    const apellido = pago.cita.paciente.apellido_paciente || pago.cita.paciente.apellidoPaciente || '';
                    acc[idPac] = { nombreCompleto: `${nombre} ${apellido}`, listaPagos: [] };
                }
                acc[idPac].listaPagos.push(pago);
                return acc;
            }, {});

            Object.entries(pagosAgrupados).forEach(([idPac, data]) => {
                const filaPrincipal = `
                <tr class="hover:bg-slate-50/50 transition-colors cursor-pointer group" onclick="document.getElementById('detalle-paciente-${idPac}').classList.toggle('hidden')">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#cde5ff] flex items-center justify-center text-[10px] font-bold text-[#005d90]">P${idPac}</div>
                            <span class="text-sm font-bold text-slate-800 group-hover:text-[#005d90] transition-colors">${data.nombreCompleto}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-slate-500">${data.listaPagos.length} pagos registrados</td>
                    <td class="px-6 py-4 text-right"><span class="material-symbols-outlined text-slate-400 group-hover:text-[#005d90]">expand_more</span></td>
                </tr>`;

                let filasDetalle = data.listaPagos.map(pago => {
                    const fecha = new Date(pago.fechaPago).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                    const idCita = pago.cita.id_cita || pago.cita.idCita;
                    const nombreServicio = pago.cita.servicio?.nombreServicio || pago.cita.servicio?.nombre || 'Consulta General';
                    return `
                    <tr class="border-b border-slate-100/50 last:border-0 hover:bg-white transition-colors">
                        <td class="px-8 py-3 text-sm font-bold text-slate-600">Cita #${idCita}</td>
                        <td class="px-6 py-3 text-sm text-slate-500">${fecha}</td>
                        <td class="px-6 py-3 font-extrabold text-[#005d90]">$${pago.monto.toFixed(2)}</td>
                        <td class="px-6 py-3 text-right"><span class="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-md">${nombreServicio}</span></td>
                    </tr>`;
                }).join('');

                const menuDesplegable = `
                <tr id="detalle-paciente-${idPac}" class="hidden bg-slate-50/50">
                    <td colspan="3" class="p-0 border-b border-slate-200">
                        <table class="w-full text-left">
                            <thead class="bg-slate-100/50">
                                <tr>
                                    <th class="px-8 py-2 text-[10px] uppercase text-slate-400 font-bold">Número de Cita</th>
                                    <th class="px-6 py-2 text-[10px] uppercase text-slate-400 font-bold">Fecha</th>
                                    <th class="px-6 py-2 text-[10px] uppercase text-slate-400 font-bold">Monto</th>
                                    <th class="px-6 py-2 text-[10px] uppercase text-slate-400 font-bold text-right">Servicio</th>
                                </tr>
                            </thead>
                            <tbody>${filasDetalle}</tbody>
                        </table>
                    </td>
                </tr>`;
                tablaPagos.innerHTML += filaPrincipal + menuDesplegable;
            });
        } catch (error) {
            if(tablaPagos) tablaPagos.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-red-500">Error al cargar historial de pagos.</td></tr>`;
        }
    }

    if(btnBuscarPaciente){
        btnBuscarPaciente.addEventListener("click", () => {
            cargarPagos(inputBuscarPaciente.value);
        });
    }

    let citasPendientesCache = [];
    let montoActual = 0;

    const btnNuevaFactura = document.getElementById("btn-nueva-factura");
    const modalPago = document.getElementById("modal-pago");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const formPago = document.getElementById("form-pago");
    const selectMetodo = document.getElementById("select-metodo");
    const divDigitos = document.getElementById("div-digitos");
    const selectCita = document.getElementById("select-cita");
    const divInfoCita = document.getElementById("info-cita-seleccionada");

    if(btnNuevaFactura){
        btnNuevaFactura.addEventListener("click", async () => {
            modalPago.classList.remove("hidden");
            selectCita.innerHTML = `<option value="">Buscando citas pendientes...</option>`;
            divInfoCita.classList.add("hidden");

            try {
                const resCitas = await fetchConAuth("http://localhost:8080/api/citas/listar");
                const resPagos = await fetchConAuth("http://localhost:8080/api/pagos/todos");

                if (!resCitas.ok || !resPagos.ok) throw new Error("Error al comunicarse con la BD");

                const todasCitas = await resCitas.json();
                const todosPagos = await resPagos.json();
                const idsPagados = todosPagos.map(p => p.cita?.id_cita || p.cita?.idCita);

                citasPendientesCache = todasCitas.filter(c => {
                    const id = c.id_cita || c.idCita;
                    return !idsPagados.includes(id);
                });

                if (citasPendientesCache.length === 0) {
                    selectCita.innerHTML = `<option value="">No hay citas pendientes de cobro</option>`;
                } else {
                    selectCita.innerHTML = `<option value="">-- Selecciona una cita --</option>`;
                    citasPendientesCache.forEach(cita => {
                        const id = cita.id_cita || cita.idCita;
                        const nombrePac = cita.paciente?.nombre_paciente || cita.paciente?.nombrePaciente || "Paciente";
                        const fechaRaw = cita.fecha_hora || cita.fechaHora || cita.fecha_creacion;
                        const fechaTxt = fechaRaw ? new Date(fechaRaw).toLocaleDateString() : 'Sin fecha';
                        selectCita.innerHTML += `<option value="${id}">Cita #${id} - ${nombrePac} (${fechaTxt})</option>`;
                    });
                }
            } catch (error) {
                console.error(error);
                selectCita.innerHTML = `<option value="">Error al cargar citas</option>`;
            }
        });
    }

    if(selectCita){
        selectCita.addEventListener("change", (e) => {
            const idSeleccionado = parseInt(e.target.value);
            if (!idSeleccionado) {
                divInfoCita.classList.add("hidden");
                montoActual = 0;
                return;
            }
            const cita = citasPendientesCache.find(c => (c.id_cita || c.idCita) === idSeleccionado);
            if (cita) {
                const nombre = cita.paciente?.nombre_paciente || cita.paciente?.nombrePaciente || "";
                const apellido = cita.paciente?.apellido_paciente || cita.paciente?.apellidoPaciente || "";
                const nombreServicio = cita.servicio?.nombreServicio || cita.servicio?.nombre || "Consulta General";
                
                montoActual = cita.servicio?.precioServicio || cita.servicio?.precio || 0;

                document.getElementById("lbl-paciente").innerText = `${nombre} ${apellido}`;
                document.getElementById("lbl-servicio").innerText = nombreServicio;
                document.getElementById("lbl-monto").innerText = `$${montoActual.toFixed(2)}`;
                divInfoCita.classList.remove("hidden");
            }
        });
    }

    if(selectMetodo){
        selectMetodo.addEventListener("change", (e) => {
            divDigitos.classList.toggle("hidden", e.target.value !== "tarjeta");
            const inputDigitos = document.getElementById("input-digitos");
            if (inputDigitos) inputDigitos.required = (e.target.value === "tarjeta");
        });
    }

    if(btnCerrarModal){
        btnCerrarModal.addEventListener("click", () => {
            modalPago.classList.add("hidden");
            formPago.reset();
            divInfoCita.classList.add("hidden");
        });
    }

    if(formPago){
        formPago.addEventListener("submit", async (e) => {
            e.preventDefault(); 
            const idCita = parseInt(selectCita.value);
            if(!idCita) { alert("⚠️ Por favor selecciona una cita para cobrar."); return; }

            const payload = {
                cita: { id_cita: idCita },
                monto: montoActual, 
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
                    alert("¡Transacción Exitosa! El pago se ha registrado.");
                    modalPago.classList.add("hidden");
                    formPago.reset();
                    divInfoCita.classList.add("hidden");
                    cargarPagos(); 
                } else {
                    const txt = await response.text();
                    throw new Error(txt);
                }
            } catch (err) { alert("Error: " + err.message); }
        });
    }

    // Iniciar
    cargarServicios();
    cargarPagos(); 
});