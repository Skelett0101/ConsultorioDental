package mx.com.ubam.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.dto.DisponibleDTO;
import mx.com.ubam.model.*;

import mx.com.ubam.repository.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/disponibilidad")
public class DisponibilidadController {
	
	@Autowired
	private DisponibilidadRepository dispoRepo;

	
	@PostMapping("/registroDispo")
	public ResponseEntity<Disponibilidad> guardarDispo(@RequestBody Disponibilidad dispo) {
        return ResponseEntity.ok(dispoRepo.save(dispo));
	}
	
	@GetMapping("/todas")
    public ResponseEntity<List<Disponibilidad>> listarTodas() {
        return ResponseEntity.ok(dispoRepo.findAll());
    }

    
    @GetMapping("/mia")
    public ResponseEntity<List<Disponibilidad>> listarMia(@RequestParam Integer idDentista) {

        return ResponseEntity.ok(dispoRepo.findByDentistaIdUsuario(idDentista));
    }
    
    @GetMapping("/horariosDisponibles")
    public ResponseEntity<List<DisponibleDTO>> obtenerHorariosLibres(@RequestParam String fecha) {
        List<DisponibleDTO> slots = new ArrayList<>();
        
        
        slots.add(new DisponibleDTO(1, "Mendoza", "09:00"));
        slots.add(new DisponibleDTO(1, "Mendoza", "10:00"));
        slots.add(new DisponibleDTO(2, "García", "11:00"));
        
        return ResponseEntity.ok(slots);
    }
	
}
