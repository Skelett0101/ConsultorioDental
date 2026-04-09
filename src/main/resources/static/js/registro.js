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


const baseUrl = window.location.origin;

try {
    const response = await fetch(`${baseUrl}/api/usuarios/registro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            // 🔐 después puedes agregar Authorization aquí
        },
        body: JSON.stringify(usuario)
    });

    if (!response.ok) {
        throw new Error("Error al registrar usuario");
    }

    const data = await response.json();

    document.getElementById("mensaje").innerText = "Usuario registrado ✅";
    console.log(data);

} catch (error) {
    document.getElementById("mensaje").innerText = error.message;
}


});
