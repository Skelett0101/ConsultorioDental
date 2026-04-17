document.addEventListener("DOMContentLoaded", () => {
    
    // Verificamos sesión
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 

    const usuario = JSON.parse(usuarioStr); 

    // Referencias al HTML
    const contenedorServicios = document.getElementById("contenedor-servicios");
    const tablaPagos = document.getElementById("tabla-pagos");
    const inputBuscarPaciente = document.getElementById("input-buscar-paciente");
    const btnBuscarPaciente = document.getElementById("btn-buscar-paciente");

    async function cargarServicios() {
        try {
            const response = await fetchConAuth("http://localhost:8080/api/servicios");
            if (!response.ok) throw new Error("Error al cargar servicios");
            
            const servicios = await response.json();
            contenedorServicios.innerHTML = ""; 

            servicios.forEach(servicio => {
                const tarjeta = `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer">
                    <div class="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                        <span class="material-symbols-outlined text-teal-700" style="font-variation-settings: 'FILL' 1;">medical_services</span>
                    </div>
                    <h4 class="font-bold text-lg text-slate-800 mb-1">${servicio.nombreServicio}</h4>
                    <div class="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                        <span class="text-2xl font-extrabold text-[#005d90]">$${servicio.precioServicio.toFixed(2)}</span>
                    </div>
                </div>
                `;
                contenedorServicios.innerHTML += tarjeta;
            });
        } catch (error) {
            console.error("No se pudieron cargar los servicios:", error);
            contenedorServicios.innerHTML = `<p class="text-red-500">Error al cargar el catálogo.</p>`;
        }
    }

    async function cargarPagos(idPaciente = 1) {
        try {
            tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500">Buscando pagos del paciente ${idPaciente}...</td></tr>`;
            
            // Inyectamos la variable en la URL
            const response = await fetchConAuth(`http://localhost:8080/api/pagos/paciente/${idPaciente}`);
            
            if (!response.ok) throw new Error("Error al cargar pagos");
            
            const pagos = await response.json();
            tablaPagos.innerHTML = ""; 
            
            if (pagos.length === 0) {
                tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500">El paciente ${idPaciente} no tiene pagos registrados.</td></tr>`;
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
                                P${pago.cita.paciente.id_paciente}
                            </div>
                            <span class="text-sm font-bold text-slate-800">Cita #${pago.cita.id_cita}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 font-extrabold text-slate-800">$${pago.monto.toFixed(2)}</td>
                    <td class="px-6 py-4 text-right">
                        <span class="px-3 py-1 bg-[#8ef4e9]/30 text-[#006f67] text-[10px] font-bold uppercase tracking-wider rounded-md">${pago.metodoPago}</span>
                    </td>
                </tr>
                `;
                tablaPagos.innerHTML += fila;
            });

        } catch (error) {
            console.error("Error al cargar los pagos:", error);
            if (error.message.includes("403") || error.message.includes("Forbidden")) {
                 tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500 font-medium"><span class="material-symbols-outlined align-middle mr-2">lock</span>No tienes permisos para ver el historial de pagos.</td></tr>`;
            } else {
                 tablaPagos.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Error de conexión. Inténtalo de nuevo.</td></tr>`;
            }
        }
    }

    // Evento para el botón de buscar
    btnBuscarPaciente.addEventListener("click", () => {
        const idBuscado = inputBuscarPaciente.value;
        if (idBuscado && idBuscado > 0) {
            cargarPagos(idBuscado);
        } else {
            alert("Por favor ingresa un ID de paciente válido.");
        }
    });

    const btnNuevaFactura = document.getElementById("btn-nueva-factura");
    const modalPago = document.getElementById("modal-pago");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");
    const formPago = document.getElementById("form-pago");
    const selectMetodo = document.getElementById("select-metodo");
    const divDigitos = document.getElementById("div-digitos");

    btnNuevaFactura.addEventListener("click", () => modalPago.classList.remove("hidden"));
    btnCerrarModal.addEventListener("click", () => modalPago.classList.add("hidden"));

    selectMetodo.addEventListener("change", (e) => {
        if (e.target.value === "tarjeta") {
            divDigitos.classList.remove("hidden");
            document.getElementById("input-digitos").required = true;
        } else {
            divDigitos.classList.add("hidden");
            document.getElementById("input-digitos").required = false;
        }
    });

    formPago.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const payload = {
            cita: {
                id_cita: parseInt(document.getElementById("input-cita").value)
            },
            monto: parseFloat(document.getElementById("input-monto").value),
            metodoPago: selectMetodo.value,
            usuarioRegistra: {
                idUsuario: usuario.idUsuario 
            },
            ultimos4Digitos: selectMetodo.value === "tarjeta" ? document.getElementById("input-digitos").value : null,
            notas: document.getElementById("input-notas").value
        };

        try {
            const response = await fetchConAuth("http://localhost:8080/api/pagos", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("No tienes autorización para registrar pagos.");
                } else if (response.status === 400) {
                     const errorMsg = await response.text();
                     throw new Error(errorMsg); 
                } else {
                    throw new Error("Ocurrió un error inesperado al procesar el pago.");
                }
            }

            alert("¡Transacción Exitosa! El pago se ha registrado.");
            modalPago.classList.add("hidden"); 
            formPago.reset(); 
            
            const idActual = inputBuscarPaciente.value || 1;
            cargarPagos(idActual); 

        } catch (error) {
            alert("❌ " + error.message);
        }
    }); 
    const btnVerificarCita = document.getElementById("btn-verificar-cita");

    if(btnVerificarCita) {
        btnVerificarCita.addEventListener("click", async () => {
            const idCita = prompt("Ingresa el ID de la Cita que deseas verificar (Ej: 3):");
            
            if (!idCita || isNaN(idCita)) return; 

            try {
                const response = await fetchConAuth(`http://localhost:8080/api/pagos/cita/${idCita}`);

                if (response.status === 404) {
                    alert(`⚠️ La Cita #${idCita} NO ESTÁ PAGADA (Pendiente de cobro).`);
                    return;
                }

                if (response.status === 403) {
                    alert("❌ No tienes autorización para consultar esta información.");
                    return;
                }

                if (!response.ok) throw new Error("Error al consultar el servidor");

                const pago = await response.json();
                const fecha = new Date(pago.fechaPago).toLocaleString('es-ES');
                
                alert(`✅ La Cita #${idCita} YA ESTÁ PAGADA.\n\nDetalles:\n- Monto: $${pago.monto.toFixed(2)}\n- Método: ${pago.metodoPago.toUpperCase()}\n- Fecha: ${fecha}\n- Cobró: ${pago.usuarioRegistra.nombre}`);

            } catch (error) {
                alert("❌ Ocurrió un error al verificar: " + error.message);
            }
        });
    }

    // Inicializar funciones al cargar la página
    cargarServicios();
    cargarPagos(1); 
});