package mx.com.ubam.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import mx.com.ubam.dto.UsuarioDTO;
import mx.com.ubam.model.Rol;
import mx.com.ubam.model.Usuario;
import mx.com.ubam.repository.RolRepository;
import mx.com.ubam.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    @Autowired
    private RolRepository rolRepository;
    
    public Usuario registrarUsuario(Usuario usuario) {

        // email
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            throw new RuntimeException("El correo es obligatorio");
        }

        // password
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        //duplicado
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // bycryp contraseña
        String passwordEncriptado = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordEncriptado);

        // gurda en la bd
        return usuarioRepository.save(usuario);
    }
    
 // todos los usuarios
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
    


    public List<UsuarioDTO> obtenerTodoElPersonal() {
        List<Usuario> todos = usuarioRepository.findAll();
        List<UsuarioDTO> lista = new ArrayList<>();
        
        for (Usuario u : todos) {
            UsuarioDTO dto = new UsuarioDTO();
            dto.setIdUsuario(u.getIdUsuario());
            dto.setNombreCompleto(u.getNombre() + " " + u.getApellido());
            dto.setEmail(u.getEmail());
            dto.setIdRol(u.getRol().getIdRol()); 
            dto.setActivo(u.getActivo());
            lista.add(dto);
        }
        return lista;
    }

    public void actualizarUsuario(Integer id, UsuarioDTO dto) {
    Usuario usuario = usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    if (dto.getNombreCompleto() != null && !dto.getNombreCompleto().isEmpty()) {
        String[] partesNombre = dto.getNombreCompleto().trim().split(" ", 2);
        usuario.setNombre(partesNombre[0]);
        usuario.setApellido(partesNombre.length > 1 ? partesNombre[1] : "");
    }

    if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
        usuario.setEmail(dto.getEmail());
    }

    if (dto.getActivo() != null) {
        usuario.setActivo(dto.getActivo());
    }

    if (dto.getIdRol() != null) {
        Rol nuevoRol = rolRepository.findById(dto.getIdRol())
            .orElseThrow(() -> new RuntimeException("El rol especificado (" + dto.getIdRol() + ") no existe"));
        usuario.setRol(nuevoRol);
    }

    usuarioRepository.save(usuario);
}


    public void cambiarPassword(Integer id, String passwordActual, String passwordNueva) {
    // buscar usuario
    Usuario usuario = usuarioRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Usuario no encontrado en la base de datos"));

    // contraseña actual coincide
    if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
        throw new RuntimeException("La contraseña actual es incorrecta");
    }

    // encripta la nueva y guarda
    usuario.setPassword(passwordEncoder.encode(passwordNueva));
    usuarioRepository.save(usuario);
}
    

public void actualizarMiPerfil(Integer id, UsuarioDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // SOLO actualizamos Nombre y Apellidos
        if (dto.getNombreCompleto() != null && !dto.getNombreCompleto().isEmpty()) {
            String[] partesNombre = dto.getNombreCompleto().trim().split(" ", 2);
            usuario.setNombre(partesNombre[0]);
            usuario.setApellido(partesNombre.length > 1 ? partesNombre[1] : "");
        }

        usuarioRepository.save(usuario);
    }
    
}