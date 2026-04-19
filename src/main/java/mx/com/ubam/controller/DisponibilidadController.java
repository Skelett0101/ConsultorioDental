package mx.com.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


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
	
	@GetMapping
    public ResponseEntity<List<Disponibilidad>> listarTodas() {
        return ResponseEntity.ok(dispoRepo.findAll());
    }

    
    @GetMapping("/mia")
    public ResponseEntity<List<Disponibilidad>> listarMia(@RequestParam Integer idDentista) {
        // Necesitarás crear este método en tu Repository
        return ResponseEntity.ok(dispoRepo.findByDentistaIdUsuario(idDentista));
    }
	
}
