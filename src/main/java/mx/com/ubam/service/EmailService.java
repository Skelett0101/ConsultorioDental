package mx.com.ubam.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Paciente;

@Service
public class EmailService {
	
	@Autowired
    private JavaMailSender mailSender;

    // 1. Envío Inmediato (Confirmación)
    public void enviarConfirmacion(Paciente paciente, LocalDateTime fecha) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(paciente.getEmailPaciente());
        message.setSubject("Cita Agendada - Clinical Atelier");
        message.setText("Hola " + paciente.getNombrePaciente() + ",\n\n" +
                        "Tu cita ha sido registrada para el: " + fecha + ".\n" +
                        "¡Gracias por confiar en nosotros!");
        mailSender.send(message);
    }

    // 2. Envío de Recordatorio (Día antes)
    public void enviarRecordatorio(String email, String nombre, LocalDateTime fecha) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Recordatorio de Cita - Clinical Atelier");
        message.setText("Hola " + nombre + ",\n\n" +
                        "Te recordamos que mañana tienes una cita programada a las " + 
                        fecha.toLocalTime() + ".\n¡Te esperamos!");
        mailSender.send(message);
    }
}