package mx.com.ubam.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.com.ubam.model.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Long>{

	//buscar todos los servicios donde activo sea true
    List<Servicio> findByActivoTrue();
    
    //buscar un servicio por su nombre
    List<Servicio> findByNombreContaining(String nombre);
}
