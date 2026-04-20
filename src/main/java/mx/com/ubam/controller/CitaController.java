package mx.com.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

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
		Page<Cita> pagina = Citaser.mostrarTodo(PageRequest.of(0, 10)); 
	    return ResponseEntity.ok(pagina.getContent());
	}

	@GetMapping("/hoy")
	public ResponseEntity<List<Cita>> obtenerCitasHoy() {
	    return ResponseEntity.ok(Citaser.obtenerCitasHoy());
	}

	
	@PutMapping("/{id}/cancelar")
	public ResponseEntity<Cita> cancelar(@PathVariable Integer id) {
	    return ResponseEntity.ok(Citaser.cambiarEstado(id, "CANCELADA"));
	}

	@PutMapping("/{id}/confirmar")
	public ResponseEntity<Cita> confirmar(@PathVariable Integer id) {
	    return ResponseEntity.ok(Citaser.cambiarEstado(id, "CONFIRMADA"));
	}
	
	@PutMapping("/{id}/completada")
	public ResponseEntity<Cita> completar(@PathVariable Integer id) {
	    return ResponseEntity.ok(Citaser.cambiarEstado(id, "COMPLETADA"));
	}
	
}
