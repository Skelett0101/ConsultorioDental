package mx.com.ubam.repository;

import mx.com.ubam.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // R46 & R50: Contador para el Dashboard (Hoy) - Se unificó para evitar duplicados
    @Query(value = "SELECT COUNT(*) FROM cita WHERE DATE(fecha_hora) = CURDATE() AND estado != 'CANCELADA'", nativeQuery = true)
    Long countCitasHoy();
    
    // R47: Citas para mañana
    @Query(value = "SELECT COUNT(*) FROM cita WHERE DATE(fecha_hora) = CURDATE() + INTERVAL 1 DAY AND estado != 'CANCELADA'", nativeQuery = true)
    Long countCitasManana();

    // R53: Busca citas cuya fecha sea exactamente mañana para Recordatorios
    @Query(value = "SELECT * FROM cita WHERE DATE(fecha_hora) = CURDATE() + INTERVAL 1 DAY", nativeQuery = true)
    List<Cita> findAllByFechaManana();

    // R51: Distribución de citas por dentista (JPQL)
    @Query("SELECT c.dentista.nombre, COUNT(c) FROM Cita c WHERE DATE(c.fechaHora) = CURRENT_DATE GROUP BY c.dentista.id, c.dentista.nombre")
    List<Object[]> countCitasPorDentistaHoy();

    // R52: Servicios populares (Native Query para MySQL)
    // Nota: Asegúrate que las columnas en 's' sean 'id_servicio' y 'nombre_servicio' según tu SQL
    @Query(value = "SELECT s.nombre_servicio, COUNT(c.id_cita) as total FROM cita c " +
                   "JOIN servicio s ON c.id_servicio = s.id_servicio " +
                   "GROUP BY s.id_servicio ORDER BY total DESC LIMIT 5", nativeQuery = true)
    List<Object[]> obtenerServiciosPopulares();
}