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
	@Query("SELECT c FROM Cita c WHERE c.dentista.idUsuario = :idD AND c.paciente.id_paciente = :idP")
	List<Cita> buscarPorFiltro(@Param("idD") Integer idDentista, @Param("idP") Integer id_paciente);
	
    boolean existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
        Integer idUsuario, 
        LocalDateTime fechaHora, 
        String estadoCita
    );
}