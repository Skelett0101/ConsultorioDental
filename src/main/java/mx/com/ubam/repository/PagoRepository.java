package mx.com.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import mx.com.ubam.model.Pago;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Integer> {

    Optional<Pago> findByCitaIdCita(Integer idCita);

    boolean existsByCitaIdCita(Integer idCita);

    @Query("SELECT p FROM Pago p WHERE p.cita.paciente.idPaciente = :idPaciente")
    List<Pago> buscarPagosPorIdPaciente(@Param("idPaciente") Long idPaciente);
    
    @Query("SELECT SUM(p.monto) FROM Pago p WHERE DATE(p.fechaPago) = CURRENT_DATE")
    BigDecimal calcularIngresosHoy();

    @Query("SELECT SUM(p.monto) FROM Pago p WHERE MONTH(p.fechaPago) = MONTH(CURRENT_DATE) AND YEAR(p.fechaPago) = YEAR(CURRENT_DATE)")
    BigDecimal calcularIngresosMes();
}