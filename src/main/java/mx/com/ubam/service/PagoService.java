package mx.com.ubam.service;

import mx.com.ubam.model.Pago;
import mx.com.ubam.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PagoService {

    @Autowired
    private PagoRepository pagoRepository;

    public Pago registrarPago(Pago pago) throws Exception {
        // R42: Verificar si la cita ya fue pagada
        if (pagoRepository.existsByCitaId(pago.getCita().getId())) {
            throw new Exception("Error: Esta cita ya cuenta con un pago registrado.");
        }

        // R44: Validar que si es tarjeta, existan los 4 dígitos
        if ("tarjeta".equalsIgnoreCase(pago.getMetodoPago())) {
            if (pago.getUltimosCuatro() == null || pago.getUltimosCuatro().length() != 4) {
                throw new Exception("Error: Para pagos con tarjeta se requieren los últimos 4 dígitos.");
            }
        } else {
            // Si es efectivo, nos aseguramos de que el campo sea nulo
            pago.setUltimosCuatro(null);
        }

        return pagoRepository.save(pago);
    }
}