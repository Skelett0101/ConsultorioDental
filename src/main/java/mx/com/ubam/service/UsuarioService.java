package mx.com.ubam.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import mx.com.ubam.model.Usuario;
import mx.com.ubam.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario) {

        // 🔹 Validar email
        if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
            throw new RuntimeException("El correo es obligatorio");
        }

        // 🔹 Validar password
        if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        // 🔹 Validar duplicado
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 🔐 Encriptar contraseña (AQUÍ ESTÁ LO IMPORTANTE)
        String passwordEncriptado = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordEncriptado);

        // 🔹 Guardar usuario
        return usuarioRepository.save(usuario);
    }
    
 // Agrega este método dentro de tu clase UsuarioService
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
}