package mx.com.ubam.repository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.Disponibilidad;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Integer> {

	List<Disponibilidad> findByDentistaIdUsuario(Integer idUsuario);
	
	boolean existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThanAndActivo(
	        Integer idUsuario, 
	        Long diaSemana, 
	        LocalTime horaCitaInicio, 
	        LocalTime horaCitaFin,
	        Long activo
	    );
}