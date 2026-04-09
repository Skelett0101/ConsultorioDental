
document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const btnSubmit = document.querySelector("#loginForm button[type='submit']");
    const msjError = document.getElementById("mensaje");
    
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Cargando...";
    msjError.textContent = "";

    const datos = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error("Credenciales incorrectas o error en el servidor");
        }

        const data = await response.json();
        
        // Separamos el token del resto de los datos
        const { token, ...datosUsuario } = data;

        // Guardamos en local
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));

        // Redirigir a las pruebas
        window.location.href = "dashboard.html";

    } catch (error) {
        msjError.textContent = error.message;
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Entrar";
    }
});