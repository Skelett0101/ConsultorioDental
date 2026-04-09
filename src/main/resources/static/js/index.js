document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const btnSubmit = document.querySelector("#loginForm button[type='submit']");
    const msjError = document.getElementById("mensaje");
    
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Cargando...";
    msjError.textContent = "";

    const baseUrl = window.location.origin;
    const datos = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        // 🔥 Leer la respuesta como texto primero
        const textResponse = await response.text();
        console.log("Respuesta cruda:", textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch(e) {
            console.error("No es JSON:", textResponse);
            throw new Error("Error del servidor: " + textResponse);
        }

        if (!response.ok) {
            // 🔥 Mostrar el mensaje de error del backend
            const errorMsg = data.error || "Credenciales incorrectas";
            throw new Error(errorMsg);
        }

        // Guardar token y datos
        const { token, ...datosUsuario } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));

        // Redirigir
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Error:", error);
        msjError.textContent = error.message;
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Entrar";
    }
});