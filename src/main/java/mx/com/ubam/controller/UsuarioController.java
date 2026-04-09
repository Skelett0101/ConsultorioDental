package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import mx.com.ubam.model.Usuario;
import mx.com.ubam.service.UsuarioService;
import mx.com.ubam.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController 
@RequestMapping("/api/usuarios") 
@CrossOrigin(origins = "*") 
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // R01: Registrar usuario (Solo Admin - Protegido por SecurityConfig)
    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario usuario) {
    	return usuarioService.registrarUsuario(usuario);
    }
    // R04: Listar todos (Solo Admin)
    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // R07: Ver perfil propio (Cualquier usuario logueado)
    @GetMapping("/perfil")
    public Usuario verPerfil(HttpServletRequest request) {
        // Extrae el ID que el JwtFilter puso en el request al validar el token
        Integer idUsuario = (Integer) request.getAttribute("usuarioId");
        return usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}