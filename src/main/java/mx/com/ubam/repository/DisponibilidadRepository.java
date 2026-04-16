package mx.com.ubam.repository;

import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.Disponibilidad;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {

	boolean existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
	        Integer idUsuario, 
	        Long diaSemana, 
	        LocalTime horaInicio, 
	        LocalTime horaFin
	    );
}