package mx.com.ubam.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.*;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer>{

	boolean existsByDentista_Id_usuarioAndFechaHoraAndEstadoCitaNot(Integer id_dentista, LocalDateTime fecha_hora, String estadoCita);
	}