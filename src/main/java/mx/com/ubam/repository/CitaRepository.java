package mx.com.ubam.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.*;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

	// Para buscar citas de hoy
	List<Cita> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

	// filtro
	List<Cita> findByDentistaIdUsuarioAndPaciente_Id_paciente(Integer idDentista, Integer id_paciente);
	
    boolean existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
        Integer idUsuario, 
        LocalDateTime fechaHora, 
        String estadoCita
    );
}