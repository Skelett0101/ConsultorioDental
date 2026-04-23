package mx.com.ubam.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
        try {
            LocalDate date = LocalDate.parse(fecha);
            
            Long diaNumerico = (long) date.getDayOfWeek().getValue(); 

            List<Disponibilidad> lista = dispoRepo.buscarPorDiaYRol(diaNumerico, 2);

            List<DisponibleDTO> dtos = lista.stream()
                .map(d -> new DisponibleDTO(
                    d.getDentista().getIdUsuario(), 
                    d.getDentista().getNombre(), 
                    d.getHoraInicio().toString()))
                .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> editarDispo(@PathVariable Integer id, @RequestBody Disponibilidad datosNuevos) {
        return dispoRepo.findById(id).map(dispo -> {
            dispo.setDiaSemana(datosNuevos.getDiaSemana());
            dispo.setHoraInicio(datosNuevos.getHoraInicio());
            dispo.setHoraFin(datosNuevos.getHoraFin());
            dispo.setActivo(datosNuevos.getActivo());
            // No solemos cambiar el dentista de una disponibilidad, pero podrías si fuera necesario
            Disponibilidad actualizada = dispoRepo.save(dispo);
            return ResponseEntity.ok(actualizada);
        }).orElse(ResponseEntity.notFound().build());
    }
	
}
