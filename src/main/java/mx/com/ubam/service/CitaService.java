package mx.com.ubam.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Cita;
import mx.com.ubam.repository.*;

@Service
public class CitaService {
	@Autowired
	private CitaRepository CitaeRepo;
	
	public CitaService(CitaRepository citaRepo) {
        this.CitaeRepo = citaRepo;
    }
	
	
	public Cita agendarCita(Cita cita) {
	    
	    boolean ocupado = CitaeRepo.existsByDentistaIdAndFechaHoraAndEstadoCitaNot(
	        cita.getId_cita(), 
	        cita.getFecha_hora(), 
	        "CANCELADA"
	    );
	    
	    if (ocupado) {
	    	
	    	throw new RuntimeException("Error: Horario Ocupado.");
        }

        // Guardar 
        return CitaeRepo.save(cita);

	}
	
	// Eliminar
	public void EliminarCita(Long id) {
		if(CitaeRepo.existsById(id)) {
		CitaeRepo.deleteById(id);
		}else {
			throw new RuntimeException("No se puede eliminar una cita que no existe.");
		}		
	}
	
	// modificar
	public Cita editarCita(Cita cita) {
		
		
        if (cita.getId_cita() == null || !CitaeRepo.existsById(cita.getId_cita())) 
        {
        	throw new RuntimeException("No se puede editar una cita que no existe.");
        }
        return CitaeRepo.save(cita);
    }
    
    public Page<Cita> mostrarTodo(Pageable pageable) {
        return CitaeRepo.findAll(pageable);
    }

}
