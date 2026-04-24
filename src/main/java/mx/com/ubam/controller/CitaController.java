package mx.com.ubam.controller;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import mx.com.ubam.model.Cita;
import mx.com.ubam.repository.*;
import mx.com.ubam.service.CitaService;

@RestController 
@CrossOrigin(origins = "*")
@RequestMapping("/api/citas")
public class CitaController {

	@Autowired
	private CitaService Citaser;
	
	//agregar citas
	@PostMapping("/registrar")
    public ResponseEntity<Cita> registrar(@RequestBody Cita cita) {
        return ResponseEntity.ok(Citaser.agendarCita(cita));
    }
	
	//modificar citas
	@PutMapping("/editar")
    public ResponseEntity<Cita> Editar(@RequestBody Cita cita) {
        return ResponseEntity.ok(Citaser.editarCita(cita));
    }
    
	
	//eliminar por id citaas
	@DeleteMapping("/eliminar/{id}")
	public ResponseEntity<String> eliminarCita(@PathVariable Integer id) {
	    Citaser.EliminarCita(id); 
	    return ResponseEntity.ok("Cita eliminada correctamente");
	}
	
	//mostrar listas
	@GetMapping("/listar")
	public ResponseEntity<List<Cita>> listar() {
		Page<Cita> pagina = Citaser.mostrarTodo(PageRequest.of(0, 1000)); 
	    return ResponseEntity.ok(pagina.getContent());
	}
	
	// Muestra solo las citas del dentista logueado
		@GetMapping("/mis-citas")
		public ResponseEntity<List<Cita>> obtenerMisCitas(Authentication authentication) {
			String dentistaUsername = authentication.getName();
			
			List<Cita> misCitas = Citaser.obtenerCitasPorDentista(dentistaUsername);
			
			return ResponseEntity.ok(misCitas);
		}

	//Devuelve las sitas que tocan el dia doy
	@GetMapping("/hoy")
	public ResponseEntity<List<Cita>> obtenerCitasHoy() {
	    return ResponseEntity.ok(Citaser.obtenerCitasHoy());
	}

	
// Ruta única para cualquier cambio de estado
   @PutMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstadoCita(@PathVariable Integer id, @RequestBody String nuevoEstado) {
        try {
            // Spring Boot recibe directamente la palabra "COMPLETADA"
            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Citaser.cambiarEstado(id, nuevoEstado.toUpperCase());
            return ResponseEntity.ok().build(); 
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); 
        }
    }
	
	// En CitaController.java
	@GetMapping("/contadorsemanas")
	public ResponseEntity<Long> getContadorSemanal() {
	    return ResponseEntity.ok(Citaser.obtenerContadorSemanal());
	}
	
}
