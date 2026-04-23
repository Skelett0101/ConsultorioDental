package mx.com.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.dto.UsuarioDTO;
import mx.com.ubam.model.Usuario;
import mx.com.ubam.service.UsuarioService;

@RestController 
@RequestMapping("/api/usuarios") 
@CrossOrigin(origins = "*") 
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // registrar usuario
    @PostMapping("/registro")
    public Usuario registrar(@RequestBody Usuario usuario) {

        return usuarioService.registrarUsuario(usuario);
    }
    
    @GetMapping
    public java.util.List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }
    
 
    // /api/usuarios/personal
    @GetMapping("/personal")
    public ResponseEntity<List<UsuarioDTO>> getPersonalCompleto() {
        List<UsuarioDTO> lista = usuarioService.obtenerTodoElPersonal();
        return ResponseEntity.ok(lista);
    }
    
    
 // /api/usuarios/actualizar/{id}
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarEmpleado(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        try {
            usuarioService.actualizarUsuario(id, dto);
            
            return ResponseEntity.ok().body("{\"mensaje\": \"Usuario actualizado correctamente\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    
}