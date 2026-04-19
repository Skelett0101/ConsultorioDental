package mx.com.ubam.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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
		validacionesyCorrecciones(cita);
		cita.setEstadoCita("PENDIENTE"); 
        cita.setFecha_creacion(LocalDateTime.now());
        return CitaeRepo.save(cita);
		
    }
	
	public void validacionesyCorrecciones(Cita cita) {
		
		//Declarar variabe
		Integer idDentista = cita.getDentista().getIdUsuario();
		LocalDateTime fechaCita = cita.getFecha_hora();
		LocalTime horaCita = cita.getFecha_hora().toLocalTime();
        Long diaSemanaDisponibles = (long) fechaCita.getDayOfWeek().getValue();
        
        //comprobar
        boolean tieneHorario = DispoRepo.existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThan(
                idDentista, 
                diaSemanaDisponibles, 
                horaCita, 
                horaCita
            );
      //comprobar la disponibilidad del dentista 
        if (!tieneHorario) {
            throw new RuntimeException("Error: El dentista no labora en ese horario o día.");
        }

        
        boolean ocupado = CitaeRepo.existsByDentistaIdUsuarioAndFechaHoraAndEstadoCitaNot(
            idDentista, 
            cita.getFecha_hora(), 
            "CANCELADA"
        );
      //comprobar la disponibilidad del dentista 
        if (ocupado) {
        	if (cita.getId_cita() == null) {
                throw new RuntimeException("Error: Ya existe una cita agendada en este horario.");
           }        }
        
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
        validacionesyCorrecciones(cita);
        return CitaeRepo.save(cita);
    }
	
    
    public Page<Cita> mostrarTodo(Pageable pageable) {
        return CitaeRepo.findAll(pageable);
    }
    
    //modificar hoy
    public Cita actualizarEstado(Integer id, String nuevoEstado) {
        Cita cita = CitaeRepo.findById(id).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        cita.setEstadoCita(nuevoEstado);
        return CitaeRepo.save(cita);
    }
    
    public Cita cambiarEstado(Integer id, String estado) {
        Cita cita = CitaeRepo.findById(id).orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        cita.setEstadoCita(estado.toUpperCase());
        return CitaeRepo.save(cita);
    }

    // Para las citas de HOY
    public List<Cita> obtenerCitasHoy() {
        LocalDateTime inicio = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime fin = LocalDateTime.now().with(LocalTime.MAX);
        // Necesitarás crear este método en el Repository
        return CitaeRepo.findByFechaHoraBetween(inicio, fin);
    }

}
