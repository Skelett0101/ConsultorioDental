package mx.com.ubam.controller;

import mx.com.ubam.model.Pago;
import mx.com.ubam.repository.PagoRepository;
import mx.com.ubam.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List; // 

@RestController
@RequestMapping("/pagos")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @Autowired
    private PagoRepository pagoRepository; 

    @PostMapping
    public ResponseEntity<?> crearPago(@RequestBody Pago pago) {
        try {
            Pago guardado = pagoService.registrarPago(pago);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cita/{id}")
    public ResponseEntity<Pago> obtenerPagoPorCita(@PathVariable Long id) {
        return ResponseEntity.ok(pagoRepository.findByCitaId(id));
    }

    @GetMapping("/paciente/{id}")
    public ResponseEntity<List<Pago>> obtenerPagosPorPaciente(@PathVariable Long id) {
        return ResponseEntity.ok(pagoRepository.findByCitaPacienteId(id));
    }
}