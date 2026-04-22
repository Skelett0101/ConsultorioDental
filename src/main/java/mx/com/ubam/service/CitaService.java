package mx.com.ubam.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.*;
import mx.com.ubam.repository.*;

@Service
public class CitaService {
	
	private  CitaRepository CitaeRepo;
    private  DisponibilidadRepository DispoRepo;
    private  PacienteRepository pacienteRepo;
    private  UsuarioRepository usuarioRepo;
    private  ServicioRepository servicioRepo;
    private EmailService AvisoEmail;

    @Autowired
	public CitaService(CitaRepository citaeRepo, DisponibilidadRepository dispoRepo, PacienteRepository pacienteRepo,
			UsuarioRepository usuarioRepo, ServicioRepository servicioRepom, EmailService AvisoEmail) {
		super();
		CitaeRepo = citaeRepo;
		DispoRepo = dispoRepo;
		this.pacienteRepo = pacienteRepo;
		this.usuarioRepo = usuarioRepo;
		this.servicioRepo = servicioRepo;
		this.AvisoEmail = AvisoEmail;
	} 
    

    public List<Cita> obtenerCitasPorDentista(String datoUsuario) {
        return CitaeRepo.findByDentista_Email(datoUsuario); 
    }
    
    
    public Cita agendarCita(Cita cita) {
		Paciente pacienteExiste = pacienteRepo.findById(cita.getPaciente().getIdPaciente())
	            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
	        Usuario dentistaExiste = usuarioRepo.findById(cita.getDentista().getIdUsuario())
	            .orElseThrow(() -> new RuntimeException("Dentista no encontrado"));
	            
	        Servicio servicioExiste = servicioRepo.findById(cita.getServicio().getIdServicio())
	            .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

	        validacionesyCorrecciones(cita);
	        
	        cita.setPaciente(pacienteExiste);
	        cita.setDentista(dentistaExiste);
	        cita.setServicio(servicioExiste);

	        cita.setEstadoCita("PENDIENTE"); 
	        cita.setFechaCreacion(LocalDateTime.now());
	        
	       
	        Cita citaLista = CitaeRepo.save(cita);
	        
	        try {
	            AvisoEmail.enviarConfirmacion(citaLista.getPaciente(), citaLista.getFechaHora());
	        } catch (Exception e) {
	           
	            System.err.println("Error al enviar correo: " + e.getMessage());
	        }
	        
	        return citaLista;
	    }
	
	public void validacionesyCorrecciones(Cita cita) {
		
		//Declarar variabe
		    Integer idDentista = cita.getDentista().getIdUsuario();
		    LocalDateTime inicio = cita.getFechaHora();
		    LocalDateTime fin = inicio.plusHours(1);
		LocalDateTime fechaCita = cita.getFechaHora();
		
        
        //comprobar
        boolean tieneHorario = DispoRepo.existsByDentistaIdUsuarioAndDiaSemanaAndHoraInicioLessThanEqualAndHoraFinGreaterThanEqualAndActivo(
                idDentista, 
                (long) inicio.getDayOfWeek().getValue(),
                inicio.toLocalTime(),
                fin.toLocalTime(),
                1L
            );
      //comprobar la disponibilidad del dentista 
        if (!tieneHorario) {
            throw new RuntimeException("El horario está fuera de la Horario laboral del dentista");
        }

     // 2. Validar Traslapes
        Integer citaId = (cita.getId_cita() == null) ? 0 : cita.getId_cita();
        Integer resultadoOcupado = CitaeRepo.existeTraslapeIgnorandoActual(idDentista, inicio, citaId);

        //comprobar la disponibilidad del dentista 
        if (resultadoOcupado != null && resultadoOcupado > 0) {
            throw new RuntimeException("Conflicto de horario: Ya existe una cita agendada. Debe haber 1 hora de diferencia.");
        }   
        if (inicio.isBefore(LocalDateTime.now())) {
            throw new RuntimeException("No puedes agendar citas en fechas pasadas");
        }
        
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

    public long obtenerContadorSemanal() {
        LocalDateTime inicio = LocalDateTime.now(); 
        LocalDateTime fin = inicio.plusDays(7);
        // Contamos las citas que NO estén canceladas
        return CitaeRepo.countByFechaHoraBetweenAndEstadoCitaNot(inicio, fin, "CANCELADA");
    }
}
