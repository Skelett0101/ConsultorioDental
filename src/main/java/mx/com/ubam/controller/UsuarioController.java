package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.model.Usuario;
import mx.com.ubam.service.UsuarioService;

@RestController 
@RequestMapping("/api/usuarios") 
@CrossOrigin(origins = "*") 
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // R01: Registrar usuario
    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario usuario) {

        //   RequestBody convierte JSON a objeto Usuario
        return usuarioService.registrarUsuario(usuario);
    }
    
    @GetMapping
    public java.util.List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }
}