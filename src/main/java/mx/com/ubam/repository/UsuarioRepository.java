package mx.com.ubam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import mx.com.ubam.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // metodo general de insert,up, delete, select
    Optional<Usuario> findByEmail(String email);
    
 // lista de todos los usuarios activos
    List<Usuario> findAllByActivoTrue();
    
    @Query("SELECT u FROM Usuario u WHERE u.rol.idRol = 2 AND u.activo = true")
    List<Usuario> findByDentistasActivos();
}
