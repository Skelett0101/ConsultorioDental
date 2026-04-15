// js/index.js

document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const btnSubmit = document.getElementById("btnSubmit");
    const msjError = document.getElementById("mensaje");
    
    // Estado de carga visual
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
        <span class="material-symbols-outlined animate-spin">sync</span>
        Conectando...
    `;
    btnSubmit.classList.add("opacity-80", "cursor-not-allowed");
    msjError.textContent = ""; // Limpiar errores

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

        const textResponse = await response.text();
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch(e) {
            console.error("No es JSON:", textResponse);
            throw new Error("Error de conexión con el servidor.");
        }

        if (!response.ok) {
            // Mostrar mensaje de error del backend
            const errorMsg = data.error || data.message || "Credenciales incorrectas";
            throw new Error(errorMsg);
        }

        // guardar token y redirigir
        const { token, ...datosUsuario } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("usuario", JSON.stringify(datosUsuario));

        // éxito antes de redirigir
        btnSubmit.innerHTML = `
            <span class="material-symbols-outlined">check_circle</span>
            Acceso Autorizado
        `;
        btnSubmit.classList.remove("signature-gradient");
        btnSubmit.classList.add("bg-teal-600");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);

    } catch (error) {
        console.error("Error:", error);
        msjError.textContent = error.message; // Mostrar error en pantalla
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.classList.remove("opacity-80", "cursor-not-allowed");
        btnSubmit.innerHTML = `
            Iniciar Sesión
            <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
        `;
    }
});