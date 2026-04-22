package mx.com.ubam.task;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import mx.com.ubam.repository.*;
import mx.com.ubam.service.*;
import mx.com.ubam.model.*;

@Component
public class RecordatorioTask {

    @Autowired
    private CitaRepository citaRepo;

    @Autowired
    private EmailService emailService;

    // Se ejecuta todos los días a las 8:00 AM
    @Scheduled(cron = "0 0 8 * * *") 
    public void enviarRecordatoriosDiarios() {
        // Calculamos el rango de "mañana"
        LocalDateTime mañanaInicio = LocalDateTime.now().plusDays(1).with(LocalTime.MIN);
        LocalDateTime mañanaFin = LocalDateTime.now().plusDays(1).with(LocalTime.MAX);

        // Buscamos citas de mañana que no estén canceladas
        List<Cita> citasDeMañana = citaRepo.findByFechaHoraBetween(mañanaInicio, mañanaFin);

        for (Cita cita : citasDeMañana) {
            if (!"CANCELADA".equals(cita.getEstadoCita())) {
                emailService.enviarRecordatorio(
                    cita.getPaciente().getEmailPaciente(),
                    cita.getPaciente().getNombrePaciente(),
                    cita.getFechaHora()
                );
            }
        }
    }
}