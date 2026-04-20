package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.model.Paciente;
import mx.com.ubam.service.PacienteService;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

	@Autowired
	private PacienteService pacienteService;
	
	//registrar paciente
	@PostMapping
    public ResponseEntity<Paciente> registrar(@RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.guardarPaciente(paciente));
    }
	
	//listar con paginación 
    @GetMapping
    public ResponseEntity<Page<Paciente>> listar(
    		//recibe el numero de la pagina desde la url
            @RequestParam(defaultValue = "0") int page,
            //recibe el tamaño de la pagina desde la url
            @RequestParam(defaultValue = "10") int size) {
    	
    	//consulta la base de datos y devuelve
        // únicamente los pacientes de esa página
        return ResponseEntity.ok(pacienteService.listarTodo(PageRequest.of(page, size)));
    }
    
    // buscar por nombre o apellido
    @GetMapping("/buscar")
    public ResponseEntity<Page<Paciente>> buscar(
            @RequestParam String nombre,
            @RequestParam String apellido,
            @RequestParam String email,
            
            //numero de pagina que se quiere consultar
            //si no se envía en la url, por defecto sera 0
            @RequestParam(defaultValue = "0") int page,
            
            //cantidad de registros que tendra cada pagina
            //si no se envía en la url, por defecto será 10
            @RequestParam(defaultValue = "10") int size) {
    	
        return ResponseEntity.ok(pacienteService.buscar(nombre, apellido, email,PageRequest.of(page, size)));
    }
    
    //obtener un paciente por id
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> obtenerPorId(@PathVariable Integer id) {
        return pacienteService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //actualizar paciente
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizar(@PathVariable Integer id, @RequestBody Paciente paciente) {
        try {
            return ResponseEntity.ok(pacienteService.actualizarPaciente(id, paciente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
