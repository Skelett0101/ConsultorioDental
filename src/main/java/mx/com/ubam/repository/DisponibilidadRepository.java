package mx.com.ubam.repository;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.Disponibilidad;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Integer> {

	List<Disponibilidad> findByDentistaIdUsuario(Integer idUsuario);
	
	// Agrega esto a DisponibilidadRepository.java
	Optional<Disponibilidad> findByDentistaIdUsuarioAndDiaSemana(Integer idUsuario, Long diaSemana);
	
	boolean existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThanEqualAndActivo(
	        Integer idUsuario, 
	        Long diaSemana, 
	        LocalTime horaCitaInicio, 
	        LocalTime horaCitaFin,
	        Long activo
	    );
	@Query("SELECT d FROM Disponibilidad d " +
		       "JOIN d.dentista u " +
		       "WHERE u.rol.idRol = :idRol " + 
		       "AND u.activo = true " +   
		       "AND d.diaSemana = :dia " + 
		       "AND d.activo = 1")        
		List<Disponibilidad> buscarPorDiaYRol(@Param("dia") Long dia, @Param("idRol") Integer idRol);
}