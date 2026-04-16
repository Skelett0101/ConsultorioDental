package mx.com.ubam.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Cita;
import mx.com.ubam.repository.*;

@Service
public class CitaService {
	
	private  CitaRepository CitaeRepo;
    private  DisponibilidadRepository DispoRepo;

    @Autowired
    public CitaService(CitaRepository citaRepo, DisponibilidadRepository dispoRepo) {
        this.CitaeRepo = citaRepo;
        this.DispoRepo = dispoRepo;
    }
	
	
	
	
	public Cita agendarCita(Cita cita) {
        
		
        DayOfWeek dow = cita.getFecha_hora().getDayOfWeek();
        Long diaSemana = (long) dow.getValue();
        LocalTime horaCita = cita.getFecha_hora().toLocalTime();
        Integer idDentista = cita.getDentista().getIdUsuario();

        
        boolean tieneHorario = DispoRepo.existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
            idDentista, 
            diaSemana, 
            horaCita, 
            horaCita
        );

        if (!tieneHorario) {
            throw new RuntimeException("Error: El dentista no labora en ese horario o día.");
        }

        
        boolean ocupado = CitaeRepo.existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
            idDentista, 
            cita.getFecha_hora(), 
            "CANCELADA"
        );
        
        if (ocupado) {
            throw new RuntimeException("Error: Ya existe una cita agendada en este horario.");
        }

        
        cita.setFecha_creacion(LocalDateTime.now());
        return CitaeRepo.save(cita);
    }
	
	// Eliminar
	public void EliminarCita(Integer id) {
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
