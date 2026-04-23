package mx.com.ubam.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Paciente;
import mx.com.ubam.repository.PacienteRepository;

@Service
public class PacienteService {

	@Autowired
	private PacienteRepository pacienteRepository;
	
	//crear paciente con validaciones
	public Paciente guardarPaciente(Paciente paciente) {
		//consulta en el repositorio si ya existe un paciente con el mismo email
		if(pacienteRepository.findByEmailPaciente(paciente.getEmailPaciente()).isPresent()) {
			throw new RuntimeException("El email ya está registrado");
		}
		paciente.setFechaCita(LocalDateTime.now());
		return pacienteRepository.save(paciente);
	}
	
	//listar todos con paginacion
	public Page<Paciente> listarTodo(Pageable pageable) {
		//obtiene todos los pacientes paginados según el pageable
        return pacienteRepository.findAll(pageable);
    }
	
	//buscar por nombre, apellido o email
    public Page<Paciente> buscar(String nombre, String apellido, String email, Pageable pageable) {
        // busca pacientes que tengan la cadena en nombre, apellido o email
        return pacienteRepository.findByNombrePacienteContainingOrApellidoPacienteContainingOrEmailPacienteContaining(nombre, apellido, email, pageable);
    }

    //ver detalle por ID
    public Optional<Paciente> buscarPorId(Integer id) {
    	//busca el paciente por id
        return pacienteRepository.findById(id);
    }
    
    //actualziar paciente
    public Paciente actualizarPaciente(Integer id, Paciente datosActualizados) {
        return pacienteRepository.findById(id).map(pacienteExistente -> {
            pacienteExistente.setNombrePaciente(datosActualizados.getNombrePaciente());
            pacienteExistente.setApellidoPaciente(datosActualizados.getApellidoPaciente());
            pacienteExistente.setTelefonoPaciente(datosActualizados.getTelefonoPaciente());
            pacienteExistente.setEmailPaciente(datosActualizados.getEmailPaciente());
            pacienteExistente.setFechaCita(datosActualizados.getFechaCita());
            
            return pacienteRepository.save(pacienteExistente);
        }).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
    }
}
