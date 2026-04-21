package mx.com.ubam.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.*;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

	// Para buscar citas de hoy
	List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

	// filtro
	@Query("SELECT c FROM Cita c WHERE c.dentista.idUsuario = :idD AND c.paciente.idPaciente = :idP")
	List<Cita> buscarPorFiltro(@Param("idD") Integer idDentista, @Param("idP") Integer idP);
	
    boolean existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
        Integer idUsuario, 
        LocalDateTime fechaHora, 
        String estadoCita
    );
    
    @Query(value = "SELECT COUNT(*) > 0 FROM cita c WHERE c.id_dentista = :id " +
            "AND c.estado <> 'CANCELADA' " +
            "AND (:inicio < DATE_ADD(c.fecha_hora, INTERVAL 1 HOUR) " +
            "AND DATE_ADD(:inicio, INTERVAL 1 HOUR) > c.fecha_hora)", 
            nativeQuery = true)
     Integer existeTraslape(@Param("id") Integer id, 
                            @Param("inicio") LocalDateTime inicio);
}