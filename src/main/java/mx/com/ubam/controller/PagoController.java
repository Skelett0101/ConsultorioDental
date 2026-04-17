package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import mx.com.ubam.model.Pago;
import mx.com.ubam.service.PagoService;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {

    @Autowired
    private PagoService pagoService;

    @PostMapping
    public ResponseEntity<?> registrarPago(@RequestBody Pago pago) {
        try {
            return ResponseEntity.ok(pagoService.registrarPago(pago));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/cita/{id}")
    public ResponseEntity<?> obtenerPagoPorCita(@PathVariable Integer id) {
        return pagoService.obtenerPorCita(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/paciente/{id}")
    public ResponseEntity<List<Pago>> obtenerPagosPorPaciente(@PathVariable Long id) {
        return ResponseEntity.ok(pagoService.obtenerPorPaciente(id));
    }

    @GetMapping("/ingresos/hoy")
    public ResponseEntity<BigDecimal> verIngresosHoy() {
        return ResponseEntity.ok(pagoService.obtenerIngresosHoy());
    }

    @GetMapping("/ingresos/mes")
    public ResponseEntity<BigDecimal> verIngresosMes() {
        return ResponseEntity.ok(pagoService.obtenerIngresosMes());
    }
}