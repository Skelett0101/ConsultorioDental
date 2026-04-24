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
	public ResponseEntity<?> registrar(@RequestBody Cita cita) {
	    try {
	    	//se toma el metodo de servicios
	        Cita guardada = Citaser.agendarCita(cita);
	        //se devuelve el json por error en tipo de bd 
	        return ResponseEntity.ok("{\"status\": \"success\", \"message\": \"Cita agendada correctamente\"}");
	    } catch (Exception e) {
	        // En caso de error nos regresa el mensaje
	        return ResponseEntity.status(500).body("{\"status\": \"error\", \"message\": \"" + e.getMessage() + "\"}");
	    }
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
	
	//mostrarlas citas de manera general
	@GetMapping("/listar")
	public ResponseEntity<List<Cita>> listar() {
		Page<Cita> pagina = Citaser.mostrarTodo(PageRequest.of(0, 1000)); 
	    return ResponseEntity.ok(pagina.getContent());
	}
	
	// Mostrar solo las citas del dentista logueado
		@GetMapping("/mis-citas")
		public ResponseEntity<List<Cita>> obtenerMisCitas(Authentication authentication) {
			String dentistaUsername = authentication.getName();
			
			List<Cita> misCitas = Citaser.obtenerCitasPorDentista(dentistaUsername);
			
			return ResponseEntity.ok(misCitas);
		}
//mostrar las citas del dia de hoy
	@GetMapping("/hoy")
	public ResponseEntity<List<Cita>> obtenerCitasHoy() {
	    return ResponseEntity.ok(Citaser.obtenerCitasHoy());
	}

	
// Rpara cambiar el estado de la cita 
   @PutMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstadoCita(@PathVariable Integer id, @RequestBody String nuevoEstado) {
        try {

            if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Citaser.cambiarEstado(id, nuevoEstado.toUpperCase());
            return ResponseEntity.ok().build(); 
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build(); 
        }
    }
	
	// para las citas de los proximos 7 dias en duda
	@GetMapping("/contadorsemanas")
	public ResponseEntity<Long> getContadorSemanal() {
	    return ResponseEntity.ok(Citaser.obtenerContadorSemanal());
	}
	
}
