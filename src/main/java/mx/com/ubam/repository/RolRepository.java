package mx.com.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import mx.com.ubam.model.Rol;
import java.util.Optional;

public interface RolRepository extends JpaRepository<Rol, Integer> {
    Optional<Rol> findByNombre(String nombre);
}