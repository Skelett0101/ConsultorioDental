package mx.com.ubam.service;

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
		return pacienteRepository.save(paciente);
	}
	
	//listar todos con paginacion
	public Page<Paciente> listarTodo(Pageable pageable) {
		//obtiene todos los pacientes paginados según el pageable
        return pacienteRepository.findAll(pageable);
    }
	
	//buscar por nombre o apellido
    public Page<Paciente> buscar(String nombre, String apellido, Pageable pageable) {
    	//busca pacientes que tengasn la cadena "nombre" o que tenga la cadena "apellido"
        return pacienteRepository.findByNombrePacienteContainingOrApellidoPacienteContaining(nombre, apellido, pageable);
    }

    //ver detalle por ID
    public Optional<Paciente> buscarPorId(Long id) {
    	//busca el paciente por id
        return pacienteRepository.findById(id);
    }
}
