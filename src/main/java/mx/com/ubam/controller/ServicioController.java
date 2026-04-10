package mx.com.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.model.Servicio;
import mx.com.ubam.service.ServicioService;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

	@Autowired
    private ServicioService servicioService;

	//---------------para admins-----------------
	
    //crear nuevo servicio
    @PostMapping
    public ResponseEntity<Servicio> crear(@RequestBody Servicio servicio) {
        return ResponseEntity.ok(servicioService.guardarServicio(servicio));
    }

    //editar servicio
    //recibe el id desde la url
    @PutMapping("/{id}")
    public ResponseEntity<Servicio> editar(@PathVariable Long id, @RequestBody Servicio servicio) {
        
    	//busca el servicio por su id
    	return servicioService.buscarPorId(id).map(s -> {
    		
    		//se asigna el id recibido al objeto servicio
        	servicio.setIdServicio(id);; // Aseguramos que edite el id correcto
        	
        	//guarda los cambios del servicio en la base de datos
            return ResponseEntity.ok(servicioService.guardarServicio(servicio));
        }).orElse(ResponseEntity.notFound().build());
    }

    //desactivar servicio
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        servicioService.eliminarLogico(id);
        return ResponseEntity.noContent().build();
    }

    //activar servicio
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        servicioService.activarServicio(id);
        return ResponseEntity.noContent().build();
    }

    //----------------Para todos xd------------------
    //-----------------------------------------------
    
    //listar solo los servicios activos
    @GetMapping
    public ResponseEntity<List<Servicio>> listarActivos() {
        return ResponseEntity.ok(servicioService.listarActivos());
    }
}
