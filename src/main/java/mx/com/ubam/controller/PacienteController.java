package mx.com.ubam.controller;

import org.springframework.web.bind.annotation.*;
import mx.com.ubam.model.Paciente;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
public class PacienteController {

    // R11: Crear paciente (Admin y Recepcionista)
	@PostMapping("/crear")
	public String registrar(@RequestBody Paciente paciente) {
        // Se conecta  con tu PacienteRepository
    	return "Paciente " + paciente.getNombrePaciente() + " registrado.";
    }

    // R13: Listar pacientes (Admin, Recepcionista, Dentista)
    @GetMapping
    public List<Paciente> listar() {
        return Collections.emptyList(); 
    }
}