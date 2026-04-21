document.addEventListener("DOMContentLoaded", () => {
    
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return; 

    let todasLasCitas = [];
    const selectDoctor = document.getElementById("select-doctor");
    const selectDiasOcupados = document.getElementById("select-dias-ocupados");
    const inputFechaLibre = document.getElementById("input-fecha-libre"); 
    
    const btnExportarPdf = document.getElementById("btn-exportar-pdf");
    const btnExportarPdfSemana = document.getElementById("btn-exportar-pdf-semana");

    const btnSemana = document.getElementById("btn-semana");
    const btnDia = document.getElementById("btn-dia");
    const btnMes = document.getElementById("btn-mes");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");
    const botonesFiltro = [btnSemana, btnDia, btnMes];

    let filtroTiempoActual = "semana"; 
    let fechaBase = new Date(); 
    fechaBase.setHours(12, 0, 0, 0);

    function parsearFechaSegura(fechaStr) {
        if (!fechaStr) return new Date("invalid");
        const limpia = String(fechaStr).split('.')[0].replace(' ', 'T');
        return new Date(limpia);
    }

    async function cargarDatosCalendario() {
        try {
            const resCitas = await fetchConAuth("http://localhost:8080/api/citas/listar");
            if (!resCitas.ok) throw new Error("Error al descargar citas");
            
            todasLasCitas = await resCitas.json();
            poblarFiltroDoctores(todasLasCitas);
            poblarFechasConCitas(todasLasCitas);
            aplicarFiltros(); 
        } catch (error) {
            console.error(error);
        }
    }

    function poblarFiltroDoctores(citas) {
        const doctoresMap = new Map();
        citas.forEach(cita => {
            if (cita.dentista) {
                const idDentista = cita.dentista.id_usuario || cita.dentista.idUsuario;
                const nombre = cita.dentista.nombre || cita.dentista.nombreUsuario || "";
                const apellido = cita.dentista.apellido || "";
                if(idDentista) doctoresMap.set(idDentista, `Dr/a. ${nombre} ${apellido}`);
            }
        });
        selectDoctor.innerHTML = `<option value="todos">Todo el Personal</option>`;
        doctoresMap.forEach((nombre, id) => { selectDoctor.innerHTML += `<option value="${id}">${nombre}</option>`; });
    }

    function poblarFechasConCitas(citas) {
        const fechasUnicas = new Set();
        citas.forEach(c => {
            const fString = c.fecha_hora || c.fechaHora || c.fecha_creacion;
            const fObj = parsearFechaSegura(fString);
            if(!isNaN(fObj.getTime())) fechasUnicas.add(fObj.toISOString().split('T')[0]);
        });
        selectDiasOcupados.innerHTML = `<option value="">📅 Buscar días ocupados...</option>`;
        Array.from(fechasUnicas).sort().forEach(fechaVal => {
            const texto = new Date(fechaVal + "T12:00:00").toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'short' });
            selectDiasOcupados.innerHTML += `<option value="${fechaVal}">${texto}</option>`;
        });
    }

    function actualizarNavegacion() {
        const year = fechaBase.getFullYear();
        const month = String(fechaBase.getMonth() + 1).padStart(2, '0');
        const day = String(fechaBase.getDate()).padStart(2, '0');
        inputFechaLibre.value = `${year}-${month}-${day}`;

        const diaSemanaActual = fechaBase.getDay() || 7; 
        const inicioSemana = new Date(fechaBase);
        inicioSemana.setDate(fechaBase.getDate() - diaSemanaActual + 1); 
        inicioSemana.setHours(0,0,0,0);
        
        const hoy = new Date();
        for(let i = 1; i <= 6; i++) {
            const spanFecha = document.getElementById(`date-${i}`);
            const fechaCol = new Date(inicioSemana);
            fechaCol.setDate(inicioSemana.getDate() + i - 1);
            if(spanFecha) {
                spanFecha.innerText = String(fechaCol.getDate()).padStart(2, '0');
                if(fechaCol.toDateString() === hoy.toDateString()) {
                    spanFecha.classList.add("date-active");
                } else {
                    spanFecha.classList.remove("date-active");
                }
            }
        }
    }

    function aplicarFiltros() {
        actualizarNavegacion();
        const idDoctorSeleccionado = selectDoctor.value;

        const diaSemanaActual = fechaBase.getDay() || 7; 
        const inicioSemana = new Date(fechaBase);
        inicioSemana.setDate(fechaBase.getDate() - diaSemanaActual + 1); 
        inicioSemana.setHours(0,0,0,0);
        
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 5); 
        finSemana.setHours(23,59,59,999);

        let citasFiltradas = todasLasCitas.filter(cita => {
            const idDentistaCita = cita.dentista?.id_usuario || cita.dentista?.idUsuario;
            const pasaFiltroDoctor = (idDoctorSeleccionado === "todos") || (idDentistaCita == idDoctorSeleccionado);

            const fechaString = cita.fecha_hora || cita.fechaHora || cita.fecha_creacion;
            const fechaCita = parsearFechaSegura(fechaString);
            
            if (isNaN(fechaCita.getTime())) return false; 

            let pasaFiltroTiempo = false;
            if (filtroTiempoActual === "dia") {
                pasaFiltroTiempo = fechaCita.toDateString() === fechaBase.toDateString();
            } else if (filtroTiempoActual === "semana") {
                pasaFiltroTiempo = fechaCita >= inicioSemana && fechaCita <= finSemana;
            } else if (filtroTiempoActual === "mes") {
                pasaFiltroTiempo = (fechaCita.getMonth() === fechaBase.getMonth()) && (fechaCita.getFullYear() === fechaBase.getFullYear());
            }

            return pasaFiltroDoctor && pasaFiltroTiempo;
        });

        renderizarCalendario(citasFiltradas);
    }

    function renderizarCalendario(citasParaMostrar) {
        for(let i = 1; i <= 6; i++) {
            const col = document.getElementById(`col-${i}`);
            if(col) col.innerHTML = "";
        }

        if (citasParaMostrar.length === 0) return;

        const colisiones = {};
        citasParaMostrar.forEach(cita => {
            const fString = cita.fecha_hora || cita.fechaHora || cita.fecha_creacion;
            const f = parsearFechaSegura(fString);
            const clave = `${f.getDay()}-${f.getHours()}`;
            if(!colisiones[clave]) colisiones[clave] = [];
            colisiones[clave].push(cita);
        });

        citasParaMostrar.forEach(cita => {
            const fString = cita.fecha_hora || cita.fechaHora || cita.fecha_creacion;
            const fechaObj = parsearFechaSegura(fString);
            const diaSemana = fechaObj.getDay(); 
            const horaCita = fechaObj.getHours();

            if(diaSemana >= 1 && diaSemana <= 6) {
                const columna = document.getElementById(`col-${diaSemana}`);
                
                const claveColision = `${diaSemana}-${horaCita}`;
                const grupoCitas = colisiones[claveColision];
                const indice = grupoCitas.findIndex(c => c.id_cita === cita.id_cita);
                
                const anchoPorcentaje = 100 / grupoCitas.length;
                let posIzquierda = indice * anchoPorcentaje;
                if (posIzquierda > 75) posIzquierda = 75 + (indice * 2);

                const nombrePac = cita.paciente?.nombre_paciente || cita.paciente?.nombrePaciente || "Paciente";
                const apellidoPac = cita.paciente?.apellido_paciente || cita.paciente?.apellidoPaciente || "";
                const servicio = cita.servicio?.nombreServicio || cita.servicio?.nombre || "Consulta";
                const horaBonita = fechaObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                
                const nombreDoc = cita.dentista?.nombre || cita.dentista?.nombreUsuario || "Doctor";
                const apellidoDoc = cita.dentista?.apellido || "";
                const textoDoctor = `Dr/a. ${nombreDoc} ${apellidoDoc}`;

                const horaInicio = 9; 
                const minutosCita = fechaObj.getMinutes();
                const horasDiferencia = horaCita - horaInicio; 
                const posicionTop = (horasDiferencia * 112) + (minutosCita * 1.86) + 6; 

                let colorFondo = "bg-sky-50"; let colorBorde = "border-sky-200"; let colorEstadoText = "bg-sky-100 text-sky-700"; let statusIcon = "schedule";
                const estadoLower = (cita.estado || "pendiente").toLowerCase();
                if(estadoLower === "confirmada") {
                    colorFondo = "bg-teal-50"; colorBorde = "border-teal-200"; colorEstadoText = "bg-teal-100 text-teal-800"; statusIcon = "check_circle";
                } else if (estadoLower === "cancelada") {
                    colorFondo = "bg-red-50"; colorBorde = "border-red-200"; colorEstadoText = "bg-red-100 text-red-800"; statusIcon = "cancel";
                }

                
                const tarjeta = `
                <div style="position: absolute; top: ${posicionTop}px; left: ${posIzquierda}%; width: ${anchoPorcentaje}%; height: 105px; z-index: ${10 + indice};" 
                     class="${colorFondo} ${colorBorde} border border-y-0 border-r-0 border-l-4 rounded-xl p-2.5 flex flex-col shadow-sm min-w-[120px] hover:min-w-[180px] hover:shadow-2xl hover:!z-50 hover:scale-110 origin-top-left transition-all duration-200 overflow-hidden cursor-pointer group">
                    <p class="text-[11px] font-bold text-sky-900 truncate pr-2 group-hover:whitespace-normal leading-tight">${nombrePac} ${apellidoPac}</p>
                    <p class="text-[9px] text-sky-700 font-medium truncate mt-0.5 group-hover:whitespace-normal leading-tight">${servicio}</p>
                    
                    <p class="text-[8.5px] text-slate-500 font-semibold truncate mt-0.5 flex items-center gap-0.5 group-hover:whitespace-normal">
                        <span class="material-symbols-outlined text-[10px]">stethoscope</span>${textoDoctor}
                    </p>
                    
                    <div class="mt-auto flex justify-between items-end gap-1 pt-1">
                        <div class="flex items-center gap-1 text-slate-500">
                            <span class="material-symbols-outlined text-[12px] text-primary">schedule</span>
                            <span class="text-[9px] font-bold text-slate-700">${horaBonita}</span>
                        </div>
                        <span class="text-[7px] font-bold px-1.5 py-0.5 rounded-full ${colorEstadoText} uppercase tracking-wide flex items-center gap-0.5">
                            <span class="material-symbols-outlined text-[9px]">${statusIcon}</span>${estadoLower}
                        </span>
                    </div>
                </div>`;

                columna.innerHTML += tarjeta;
            }
        });
    }

    function activarBotonTiempo(nuevoFiltro, botonClicado) {
        filtroTiempoActual = nuevoFiltro;
        botonesFiltro.forEach(btn => {
            btn.classList.remove("text-slate-800", "bg-white", "shadow-md", "rounded-full");
            btn.classList.add("text-slate-500");
        });
        botonClicado.classList.remove("text-slate-500");
        botonClicado.classList.add("text-slate-800", "bg-white", "shadow-md", "rounded-full");
        aplicarFiltros(); 
    }

    btnSemana.addEventListener("click", () => activarBotonTiempo("semana", btnSemana));
    btnDia.addEventListener("click", () => activarBotonTiempo("dia", btnDia));
    btnMes.addEventListener("click", () => activarBotonTiempo("mes", btnMes));
    selectDoctor.addEventListener("change", aplicarFiltros);

    btnPrev.addEventListener("click", () => {
        if(filtroTiempoActual === "dia") fechaBase.setDate(fechaBase.getDate() - 1);
        else if(filtroTiempoActual === "semana") fechaBase.setDate(fechaBase.getDate() - 7);
        else if(filtroTiempoActual === "mes") fechaBase.setMonth(fechaBase.getMonth() - 1);
        aplicarFiltros();
    });
    btnNext.addEventListener("click", () => {
        if(filtroTiempoActual === "dia") fechaBase.setDate(fechaBase.getDate() + 1);
        else if(filtroTiempoActual === "semana") fechaBase.setDate(fechaBase.getDate() + 7);
        else if(filtroTiempoActual === "mes") fechaBase.setMonth(fechaBase.getMonth() + 1);
        aplicarFiltros();
    });
    inputFechaLibre.addEventListener("change", (e) => {
        if(e.target.value) { fechaBase = new Date(e.target.value + "T12:00:00"); aplicarFiltros(); }
    });
    selectDiasOcupados.addEventListener("change", (e) => {
        if(e.target.value) { fechaBase = new Date(e.target.value + "T12:00:00"); activarBotonTiempo("dia", btnDia); }
    });

    if(btnExportarPdf) {
        btnExportarPdf.addEventListener("click", async () => {
            try {
                const contenidoOriginal = btnExportarPdf.innerHTML;
                btnExportarPdf.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin text-red-500">sync</span> Generando...`;
                btnExportarPdf.disabled = true;

                const response = await fetchConAuth("http://localhost:8080/reportes/citas/pdf");
                if (!response.ok) throw new Error("Error al generar PDF");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, "_blank");

                btnExportarPdf.innerHTML = contenidoOriginal;
                btnExportarPdf.disabled = false;
            } catch (error) {
                console.error("Error PDF:", error);
                alert("Hubo un error interno al generar el PDF de la agenda.");
                btnExportarPdf.innerHTML = `<span class="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span> General`;
                btnExportarPdf.disabled = false;
            }
        });
    }

    if(btnExportarPdfSemana) {
        btnExportarPdfSemana.addEventListener("click", async () => {
            try {
                const contenidoOriginal = btnExportarPdfSemana.innerHTML;
                btnExportarPdfSemana.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin text-blue-500">sync</span> Generando...`;
                btnExportarPdfSemana.disabled = true;

                const diaSemanaActual = fechaBase.getDay() || 7; 
                const inicioSemana = new Date(fechaBase);
                inicioSemana.setDate(fechaBase.getDate() - diaSemanaActual + 1); 
                const finSemana = new Date(inicioSemana);
                finSemana.setDate(inicioSemana.getDate() + 5); 

                const strInicio = inicioSemana.toISOString().split('T')[0];
                const strFin = finSemana.toISOString().split('T')[0];

                const url = `http://localhost:8080/reportes/agenda-semanal/pdf?inicio=${strInicio}&fin=${strFin}`;
                const response = await fetchConAuth(url);
                
                if (!response.ok) throw new Error("Error al generar PDF");

                const blob = await response.blob();
                const fileUrl = window.URL.createObjectURL(blob);
                window.open(fileUrl, "_blank");

                btnExportarPdfSemana.innerHTML = contenidoOriginal;
                btnExportarPdfSemana.disabled = false;

            } catch (error) {
                console.error("Error PDF Semanal:", error);
                alert("Hubo un error interno al generar el PDF de la agenda semanal.");
                btnExportarPdfSemana.innerHTML = `<span class="material-symbols-outlined text-[16px] text-blue-500">date_range</span> Semanal`;
                btnExportarPdfSemana.disabled = false;
            }
        });
    }

    const slider = document.getElementById('calendario-scroll');
    let isDown = false; let startX; let scrollLeft;

    if(slider) {
        slider.addEventListener('mousedown', (e) => {
            if(e.target.closest('.group')) return; 
            isDown = true; slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return; e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; 
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    cargarDatosCalendario();
});