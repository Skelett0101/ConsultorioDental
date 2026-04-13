package mx.com.ubam.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import mx.com.ubam.model.Paciente;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    
    // R45: Para buscar un paciente específico por su email
    Optional<Paciente> findByEmailPaciente(String email);

    // Para el buscador del dashboard
    Page<Paciente> findByNombrePacienteContainingOrApellidoPacienteContaining(
        String nombre, String apellido, Pageable pageable);
    
}