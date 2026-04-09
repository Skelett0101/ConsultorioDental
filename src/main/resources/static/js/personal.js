// js/personal.js

// Funciones para controlar la ventana modal de permisos
const modal = document.getElementById("modalPermisos");
const modalBox = document.getElementById("modalBox");
const uiModalNombre = document.getElementById("modalNombre");
const uiModalRol = document.getElementById("modalRol");

function abrirModal(nombreEmpleado, rolEmpleado) {
    // 1. Llenamos los datos dinámicos en la ventanita
    uiModalNombre.textContent = nombreEmpleado;
    uiModalRol.textContent = rolEmpleado;

    // 2. Mostramos el modal
    modal.classList.remove("hidden");
    
    // 3. Pequeño truco para que se anime suavemente (fade in)
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalBox.classList.remove("scale-95");
        modalBox.classList.add("scale-100");
    }, 10);
}

function cerrarModal() {
    // 1. Animación de salida (fade out)
    modal.classList.add("opacity-0");
    modalBox.classList.remove("scale-100");
    modalBox.classList.add("scale-95");

    // 2. Ocultamos el div después de que termine la animación
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);
}