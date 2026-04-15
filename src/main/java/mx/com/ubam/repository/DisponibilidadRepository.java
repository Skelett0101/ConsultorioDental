package mx.com.ubam.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.Disponibilidad;

@Repository
public interface DisponibilidadRepository extends JpaRepository<Disponibilidad, Long> {

	boolean DispoExistente(Long id_dentista, long diaSemana, String estadoCita);
}
