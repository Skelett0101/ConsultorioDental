package mx.com.ubam.repository;

import mx.com.ubam.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // R42: Verifica si la cita ya existe en la tabla de pagos
    // Usamos la ruta del atributo 'id' dentro del objeto 'cita'
    boolean existsByCitaId(Long id);

    // R45: Buscar pago por ID de cita usando JPQL para mayor precisión
    @Query("SELECT p FROM Pago p WHERE p.cita.id = :citaId")
    Pago findByCitaId(@Param("citaId") Long citaId);

    // R45: Buscar historial de pagos de un paciente
    @Query("SELECT p FROM Pago p WHERE p.cita.paciente.id = :pacienteId")
    List<Pago> findByCitaPacienteId(@Param("pacienteId") Long pacienteId);

    // R49: Ingresos del día para el Dashboard
    @Query(value = "SELECT COALESCE(SUM(monto), 0) FROM pago WHERE DATE(fecha_pago) = CURDATE()", nativeQuery = true)
    Double obtenerIngresosDia();

    // R50: Ingresos del mes para el Dashboard
    @Query(value = "SELECT COALESCE(SUM(monto), 0) FROM pago WHERE MONTH(fecha_pago) = MONTH(CURDATE()) AND YEAR(fecha_pago) = YEAR(CURDATE())", nativeQuery = true)
    Double obtenerIngresosMes();
}