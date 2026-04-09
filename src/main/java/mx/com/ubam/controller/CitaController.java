package mx.com.ubam.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitaController {

    // R31: Listar mis citas (Solo para el rol Dentista)
    @GetMapping("/mis-citas")
    public String listarCitasDentista(HttpServletRequest request) {
        // Extrae el ID del dentista directamente del Token JWT validado
        Integer idDentista = (Integer) request.getAttribute("usuarioId");
        
        // Aquí buscara en la base de datos: citaRepository.findByIdDentista(idDentista)
        return "Citas obtenidas para el dentista logueado con ID: " + idDentista;
    }

    // R27: Crear cita (Admin y Recepcionista)
    @PostMapping
    public String crearCita() {
        return "Cita agendada correctamente.";
    }
}