const form = document.getElementById("registroForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        rol: {
            idRol: parseInt(document.getElementById("rol").value)
        }
    };

    try {
        // Usamos fetchConAuth para que envíe el Token del Admin
        const response = await fetchConAuth("http://localhost:8080/api/usuarios/registro", {
            method: "POST",
            body: JSON.stringify(usuario)
        });

        if (response.status === 403) {
            throw new Error("🚫 No tienes permiso. Solo un Administrador puede registrar usuarios.");
        }

        if (!response.ok) {
            throw new Error("Error al registrar usuario. Revisa los datos.");
        }

        document.getElementById("mensaje").style.color = "green";
        document.getElementById("mensaje").innerText = "Usuario registrado con éxito ✅";
        form.reset();

    } catch (error) {
        document.getElementById("mensaje").style.color = "red";
        document.getElementById("mensaje").innerText = error.message;
    }
});