package mx.com.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import mx.com.ubam.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // metodo general de insert,up, delete, select
    Optional<Usuario> findByEmail(String email);
    
 // lista de todos los usuarios activos
    List<Usuario> findAllByActivoTrue();
}
