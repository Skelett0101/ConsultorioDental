// js/personal.js

// 🔥 DICCIONARIO DE ROLES (Traductor de ID a Texto)
const MAPA_ROLES = {
    1: "ADMINISTRADOR",
    2: "DENTISTA",
    3: "RECEPCIONISTA"
};

document.addEventListener("DOMContentLoaded", () => {
    cargarPersonal();

    // Dinamismo del switch de estado en "Editar"
    const checkboxEstado = document.getElementById("estadoEditar");
    const textoEstado = document.getElementById("textoEstadoEditar");
    if(checkboxEstado) {
        checkboxEstado.addEventListener("change", (e) => {
            textoEstado.textContent = e.target.checked ? "Activo" : "Inactivo";
        });
    }
});

// ==========================================
// 1. CARGAR Y PINTAR LA TABLA
// ==========================================
async function cargarPersonal() {
    try {
        const response = await fetchConAuth("http://localhost:8080/api/usuarios/personal"); 
        if (!response.ok) throw new Error("No se pudo cargar el personal");

        const empleados = await response.json();

        // Contamos para las tarjetas
        const activos = empleados.filter(emp => emp.activo === true);
        if(document.getElementById("uiTotalActivos")) {
            document.getElementById("uiTotalActivos").textContent = activos.length;
        }
        if(document.getElementById("uiRolesAdmin")) {
            // Filtramos a los que NO son dentistas (ID 2)
            document.getElementById("uiRolesAdmin").textContent = activos.filter(emp => emp.idRol !== 2).length;
        }

        // Pintar tabla
        renderizarTabla(empleados);
    } catch (error) {
        console.error(error);
    }
}

function renderizarTabla(empleados) {
    const contenedor = document.getElementById("tablaPersonal");
    contenedor.innerHTML = ""; 

    empleados.forEach(emp => {
        const iniciales = obtenerIniciales(emp.nombreCompleto);
        const colorAvatar = emp.activo ? "bg-[#cde5ff] text-[#005d90]" : "bg-slate-200 text-slate-500";
        
        const estadoHtml = emp.activo
            ? `<span class="bg-[#8ef4e9]/30 text-[#006f67] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2">Activo</span>`
            : `<span class="bg-slate-200 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2">Inactivo</span>`;

        // 🔥 Traducimos el número a texto usando el diccionario
        const textoRol = MAPA_ROLES[emp.idRol] || "DESCONOCIDO";

        // Pasamos el emp.idRol numérico a la función
       // 🔥 ¡Adiós a la cárcel! El botón siempre sale para todos
        const btnEditar = `<button onclick="abrirModalEditar(${emp.idUsuario}, '${emp.nombreCompleto}', '${emp.email}', ${emp.idRol}, ${emp.activo})" class="text-xs font-bold text-primary bg-primary-fixed/30 hover:bg-primary-fixed/60 px-4 py-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100">Editar Perfil</button>`;
        const fila = `
            <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full ${colorAvatar} flex items-center justify-center font-bold text-sm shadow-sm">${iniciales}</div>
                    <div>
                        <div class="flex items-center">
                            <p class="text-sm font-bold text-slate-800">${emp.nombreCompleto}</p>${estadoHtml}
                        </div>
                        <p class="text-xs text-slate-500 font-medium">${emp.email} • <span class="font-bold text-slate-700">${textoRol}</span></p>
                    </div>
                </div>
                ${btnEditar}
            </div>
        `;
        contenedor.innerHTML += fila;
    });
}

function obtenerIniciales(nombre) {
    if (!nombre) return "NN";
    const partes = nombre.trim().split(" ");
    return partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : nombre.substring(0, 2).toUpperCase();
}


// ==========================================
// 2. LÓGICA DEL MODAL: NUEVO EMPLEADO
// ==========================================
const modalNuevo = document.getElementById("modalNuevo");
const modalBoxNuevo = document.getElementById("modalBoxNuevo");

function abrirModalNuevo() {
    document.getElementById("registroForm").reset();
    document.getElementById("mensajeNuevo").textContent = "";
    modalNuevo.classList.remove("hidden");
    setTimeout(() => {
        modalNuevo.classList.remove("opacity-0");
        modalBoxNuevo.classList.remove("scale-95");
        modalBoxNuevo.classList.add("scale-100");
    }, 10);
}

function cerrarModalNuevo() {
    modalNuevo.classList.add("opacity-0");
    modalBoxNuevo.classList.remove("scale-100");
    modalBoxNuevo.classList.add("scale-95");
    setTimeout(() => modalNuevo.classList.add("hidden"), 300);
}

// LÓGICA DE REGISTRO
document.getElementById("registroForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnGuardarNuevo");
    const msj = document.getElementById("mensajeNuevo");
    
    btn.disabled = true;
    btn.textContent = "Guardando...";

    const usuario = {
        nombre: document.getElementById("nombreNuevo").value,
        apellido: document.getElementById("apellidoNuevo").value,
        email: document.getElementById("emailNuevo").value,
        password: document.getElementById("passwordNuevo").value,
        rol: { idRol: parseInt(document.getElementById("rolEditar").value) }
    };

    try {
        const response = await fetchConAuth("http://localhost:8080/api/usuarios/registro", {
            method: "POST",
            body: JSON.stringify(usuario)
        });

        if (!response.ok) throw new Error("Error al registrar usuario");

        msj.classList.replace("text-red-500", "text-teal-600");
    
        mostrarAlerta("Empleado registrado con éxito", 'success');
        
        // Recargar la tabla y cerrar modal
        setTimeout(() => {
            cerrarModalNuevo();
            cargarPersonal(); 
        }, 1500);

    } catch (error) {
        msj.classList.replace("text-teal-600", "text-red-500");
        msj.textContent = error.message;
    } finally {
        btn.disabled = false;
        btn.textContent = "Registrar Empleado";
    }
});


// ==========================================
// 3. LÓGICA DEL MODAL: EDITAR EMPLEADO
// ==========================================
const modalEditar = document.getElementById("modalEditar");
const modalBoxEditar = document.getElementById("modalBoxEditar");

// 🔥 Recibimos el idRol y lo asignamos directo al Select
function abrirModalEditar(id, nombre, email, idRol, activo) {
    // Llenar campos
    document.getElementById("modalNombreDisplay").textContent = nombre;
    document.getElementById("idEditar").value = id;
    document.getElementById("nombreEditar").value = nombre;
    document.getElementById("emailEditar").value = email;
    document.getElementById("rolEditar").value = idRol; 
    
    const checkboxActivo = document.getElementById("estadoEditar");
    checkboxActivo.checked = activo;
    document.getElementById("textoEstadoEditar").textContent = activo ? "Activo" : "Inactivo";

    modalEditar.classList.remove("hidden");
    setTimeout(() => {
        modalEditar.classList.remove("opacity-0");
        modalBoxEditar.classList.remove("scale-95");
        modalBoxEditar.classList.add("scale-100");
    }, 10);
}

function cerrarModalEditar() {
    modalEditar.classList.add("opacity-0");
    modalBoxEditar.classList.remove("scale-100");
    modalBoxEditar.classList.add("scale-95");
    setTimeout(() => modalEditar.classList.add("hidden"), 300);
}

// 🔥 LÓGICA REAL PARA ACTUALIZAR AL BACKEND 🔥
document.getElementById("editarForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // 1. Extraemos el ID del usuario oculto 
    const idUsuario = document.getElementById("idEditar").value;
    
    // 2. TRUCO INFALIBLE: Buscamos el select SOLO dentro de ESTE formulario (e.target)
    // Así evitamos que JS lea el modal de "Nuevo Empleado" por accidente.
    const selectRol = e.target.querySelector("#rolEditar");
    const valorSeleccionado = selectRol.value;

    const datosActualizados = {
        nombreCompleto: document.getElementById("nombreEditar").value,
        email: document.getElementById("emailEditar").value,
        idRol: parseInt(valorSeleccionado), // Ahora sí agarrará el correcto
        activo: document.getElementById("estadoEditar").checked
    };

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.textContent;
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Actualizando...";

    try {
        const response = await fetchConAuth(`http://localhost:8080/api/usuarios/actualizar/${idUsuario}`, {
            method: "PUT",
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Error al actualizar");
        }

        // Cerramos el modal y recargamos los datos para ver los cambios
        cerrarModalEditar();
        cargarPersonal(); 

    } catch (error) {
        alert(error.message); 
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = textoOriginal;
    }
});