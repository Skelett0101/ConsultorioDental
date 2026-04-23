package mx.com.ubam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.*;
import mx.com.ubam.repository.*;

@Service
public class DisponibilidadService {

    @Autowired
    private DisponibilidadRepository dispoRepo;

    //Editar Udsuarios
    public Disponibilidad actualizar(Integer id, Disponibilidad datosNuevos) {
        return dispoRepo.findById(id).map(dispo -> {
            dispo.setDiaSemana(datosNuevos.getDiaSemana());
            dispo.setHoraInicio(datosNuevos.getHoraInicio());
            dispo.setHoraFin(datosNuevos.getHoraFin());
            dispo.setActivo(datosNuevos.getActivo());
            return dispoRepo.save(dispo);
        }).orElseThrow(() -> new RuntimeException("Horario no encontrado"));
    }
    
    //nuevos horarios
    public Disponibilidad crear(Disponibilidad dispo) {
        return dispoRepo.save(dispo);
    }
}