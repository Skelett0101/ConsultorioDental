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
        System.out.println("---- INICIANDO ACTUALIZACIÓN ----");
        System.out.println("Buscando usuario con ID: " + id);
        
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        System.out.println("Usuario encontrado: " + usuario.getNombre() + " - Rol actual: " + (usuario.getRol() != null ? usuario.getRol().getIdRol() : "Ninguno"));

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

       
        System.out.println("ID Rol recibido del DTO: " + dto.getIdRol());
        
        if (dto.getIdRol() != null) {
            Rol nuevoRol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new RuntimeException("El rol especificado (" + dto.getIdRol() + ") no existe"));
                
            System.out.println("Rol encontrado en BD: " + nuevoRol.getNombre());
            usuario.setRol(nuevoRol); // asignar nwe roll
            System.out.println("Rol asignado al usuario antes de guardar: " + usuario.getRol().getIdRol());
        }

        // guardar
        usuarioRepository.save(usuario);
        System.out.println("---- ACTUALIZACIÓN TERMINADA ----");
    }
    
    
}