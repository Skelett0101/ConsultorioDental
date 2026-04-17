package mx.com.ubam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.com.ubam.model.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Integer>{

    //buscar todos los servicios donde activoServicio sea true
    List<Servicio> findByActivoServicioTrue();
    
    //buscar un servicio por su nombreServicio
    List<Servicio> findByNombreServicioContaining(String nombreServicio);
}