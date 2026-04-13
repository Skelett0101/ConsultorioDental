package mx.com.ubam.service;

import mx.com.ubam.model.Cita;
import mx.com.ubam.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RecordatorioService {

    @Autowired 
    private CitaRepository citaRepository;

    // Asegúrate de tener creada esta clase EmailService para enviar los correos
    @Autowired 
    private EmailService emailService; 

    // R53: Envío automático 24h antes (Cada día a las 8 AM)
    @Scheduled(cron = "0 0 8 * * *") 
    public void enviarRecordatoriosR53() {
        // Busca citas para mañana usando la lógica de repositorio
    	List<Cita> citasManana = citaRepository.findAllByFechaManana();;
        
        for (Cita cita : citasManana) {
            // Ajustado a los nombres de tu modelo: emailPaciente y nombrePaciente
            String email = cita.getPaciente().getEmailPaciente();
            String nombre = cita.getPaciente().getNombrePaciente();
            
            String mensaje = "Hola " + nombre + ", te recordamos tu cita para mañana.";
            
            emailService.enviar(email, "Recordatorio de Cita - Clinical Atelier", mensaje);
        }
    }
}