package mx.com.ubam.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import mx.com.ubam.model.Paciente;

public interface PacienteRepository extends JpaRepository<Paciente, Long>{

	// para buscar un paciente específico por su email exacto
    Optional<Paciente> findByEmailPaciente(String email);

    //buscar por nombre o apellido
    Page<Paciente> findByNombrePacienteContainingOrApellidoPacienteContaining
    (String nombre, String apellido, Pageable pageable);

}
