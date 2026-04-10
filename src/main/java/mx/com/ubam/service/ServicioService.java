package mx.com.ubam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Servicio;
import mx.com.ubam.repository.ServicioRepository;

@Service
public class ServicioService {

	@Autowired
	private ServicioRepository servicioRepository;
	
	//crear o Editar servicio
    public Servicio guardarServicio(Servicio servicio) {
        return servicioRepository.save(servicio);
    }

    //listar solo servicios activos
    public List<Servicio> listarActivos() {
        return servicioRepository.findByActivoServicioTrue();
    }

    //desactivar servicio
    public void eliminarLogico(Long id) {
    	//busca por id le servicio
        Optional<Servicio> servicioOpt = servicioRepository.findById(id);
        if (servicioOpt.isPresent()) {
        	
        	// se obtiene el objeto y se cambia el campo ActivoServicio a false.
            Servicio servicio = servicioOpt.get();
            servicio.setActivoServicio(false); // cambiamos el estado
            servicioRepository.save(servicio); // guardamos el cambio
        }
    }
    
    // activar servicio
    public void activarServicio(Long id) {
        Optional<Servicio> servicioOpt = servicioRepository.findById(id);
        if (servicioOpt.isPresent()) {
        	//se obtiene el objeto y el campo ActivoServicio a true
            Servicio servicio = servicioOpt.get();
            servicio.setActivoServicio(true);
            servicioRepository.save(servicio);
        }
    }
    
    //ver detalle de un servicio por ID
    public Optional<Servicio> buscarPorId(Long id) {
        return servicioRepository.findById(id);
    }
}
