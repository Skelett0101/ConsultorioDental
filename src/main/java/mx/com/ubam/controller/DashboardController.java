package mx.com.ubam.controller;

import mx.com.ubam.repository.PagoRepository;
import mx.com.ubam.repository.CitaRepository;
import mx.com.ubam.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;    
import java.util.HashMap; 

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired private PagoRepository pagoRepository;
    @Autowired private CitaRepository citaRepository;
    @Autowired private PacienteRepository pacienteRepository; // Necesitas crear esta interfaz

    @GetMapping("/metricas-financieras")
    @PreAuthorize("hasRole('ADMIN')") // R49, R50
    public ResponseEntity<Map<String, Object>> getFinanzas() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("ingresosDia", pagoRepository.obtenerIngresosDia()); 
        metrics.put("ingresosMes", pagoRepository.obtenerIngresosMes()); 
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/contadores")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCIONISTA')") // R46, R47, R48
    public ResponseEntity<Map<String, Object>> getContadores() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("citasHoy", citaRepository.countCitasHoy()); 
        stats.put("citasManana", citaRepository.countCitasManana()); 
        stats.put("totalPacientes", pacienteRepository.count()); 
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/servicios-populares") // R52
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> getPopulares() {
        return ResponseEntity.ok(citaRepository.obtenerServiciosPopulares());
    }
}