package mx.com.ubam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import mx.com.ubam.model.*;
import mx.com.ubam.repository.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepo;

    @Autowired
    private CitaRepository citaRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    public Pago registrarPago(Pago pago) {
        // Buscar entidades reales para evitar TransientPropertyValueException
        Cita citaReal = citaRepo.findById(pago.getCita().getId_cita())
                .orElseThrow(() -> new RuntimeException("Error: La cita no existe."));
        
        Usuario usuarioReal = usuarioRepo.findById(pago.getUsuarioRegistra().getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Error: El usuario no existe."));

        pago.setCita(citaReal);
        pago.setUsuarioRegistra(usuarioReal);

        // Validaciones R42 y R44
        if (pagoRepo.existsByCitaIdCita(citaReal.getId_cita())) {
            throw new RuntimeException("Error: Esta cita ya cuenta con un pago registrado.");
        }

        if (pago.getMetodoPago().equalsIgnoreCase("tarjeta")) {
            if (pago.getUltimos4Digitos() == null || pago.getUltimos4Digitos().length() != 16) {
                throw new RuntimeException("Error: Se requieren los 16 dígitos de la tarjeta para procesar el pago.");
            }
        }

        return pagoRepo.save(pago);
    }

    public Optional<Pago> obtenerPorCita(Integer idCita) {
        return pagoRepo.findByCitaIdCita(idCita);
    }

    public List<Pago> obtenerPorPaciente(Integer idPaciente) {
        return pagoRepo.buscarPagosPorIdPaciente(idPaciente);
    }

    public BigDecimal obtenerIngresosHoy() {
        BigDecimal total = pagoRepo.calcularIngresosHoy();
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public List<Pago> obtenerTodos() {
        return pagoRepo.findAll();
    }

    public BigDecimal obtenerIngresosMes() {
        BigDecimal total = pagoRepo.calcularIngresosMes();
        return total != null ? total : BigDecimal.ZERO;
    }
}