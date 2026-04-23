// js/perfil.js

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosPerfil();
});

// 1. Cargar datos desde el LocalStorage al abrir la página
function cargarDatosPerfil() {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr) return;

    const usuario = JSON.parse(usuarioStr);

    // Llenar Formulario de Información Personal
    // Como en menu.js vimos que tienes usuario.nombre y usuario.apellido separados en el JSON
    document.getElementById("inputNombre").value = usuario.nombre || "";
    document.getElementById("inputApellidos").value = usuario.apellido || "";
    document.getElementById("inputEmail").value = usuario.email || "";
    document.getElementById("inputRol").value = usuario.rol || "DESCONOCIDO";

    // Llenar Tarjeta Visual de la derecha
    document.getElementById("cardNombre").textContent = `${usuario.nombre} ${usuario.apellido}`;
    document.getElementById("cardRol").textContent = usuario.rol;
    
    // Generar iniciales para la tarjeta
    const inicial1 = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "N";
    const inicial2 = usuario.apellido ? usuario.apellido.charAt(0).toUpperCase() : "N";
    document.getElementById("cardIniciales").textContent = inicial1 + inicial2;
}

// 2. Lógica para Guardar Información Personal
document.getElementById("formInfoPersonal").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Guardando...";

    const usuarioStorage = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = usuarioStorage.idUsuario;

    const nombre = document.getElementById("inputNombre").value.trim();
    const apellido = document.getElementById("inputApellidos").value.trim();

    const datosActualizados = {
        // Concatenamos para que el backend lo reciba como el DTO lo pide
        nombreCompleto: nombre + " " + apellido, 
        email: document.getElementById("inputEmail").value,
        idRol: usuarioStorage.idRol, // Lo mandamos igual para que no cambie
        activo: true
    };

    try {
        // Llamamos a la misma ruta que usaste en personal.js
        const response = await fetchConAuth(`http://localhost:8080/api/usuarios/perfil/${idUsuario}`, {
            method: "PUT",
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) throw new Error("Error al guardar perfil");

        mostrarAlerta("Información personal actualizada. Los cambios se verán al reiniciar sesión.", "success");
        
        // Actualizamos la tarjeta visual
        document.getElementById("cardNombre").textContent = `${nombre} ${apellido}`;
        
    } catch (error) {
        mostrarAlerta(error.message, "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Guardar Cambios";
    }
});

// 3. Lógica para Actualizar Contraseña (R09)
document.getElementById("formSeguridad").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const passActual = document.getElementById("passActual").value;
    const passNueva = document.getElementById("passNueva").value;
    const passConfirmar = document.getElementById("passConfirmar").value;

    // Validación Frontend R09 (Coincidencia)
    if (passNueva !== passConfirmar) {
        mostrarAlerta("Las contraseñas nuevas no coinciden.", "error");
        return;
    }

    const btnSubmit = e.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Actualizando...";

    const idUsuario = JSON.parse(localStorage.getItem("usuario")).idUsuario;
    
    const datosPassword = {
        passwordActual: passActual,
        passwordNueva: passNueva
    };

    try {
        // Llama a la ruta nueva de Password que creaste en Spring Boot
        const response = await fetchConAuth(`http://localhost:8080/api/usuarios/cambiar-password/${idUsuario}`, {
            method: "PUT",
            body: JSON.stringify(datosPassword)
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Error al actualizar contraseña");

        mostrarAlerta("Contraseña actualizada exitosamente.", "success");
        document.getElementById("formSeguridad").reset(); // Limpia los campos

    } catch (error) {
        mostrarAlerta(error.message, "error");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Actualizar Contraseña";
    }
});