package mx.com.ubam.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mx.com.ubam.model.*;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {

    // Fíjate en la 'F' de FechaHora y la 'E' de EstadoCita después de los 'And'
    boolean existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
        Integer idUsuario, 
        LocalDateTime fechaHora, 
        String estadoCita
    );
}