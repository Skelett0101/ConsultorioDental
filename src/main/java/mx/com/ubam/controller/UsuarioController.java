package mx.com.ubam.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import mx.com.ubam.dto.PasswordDTO;
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
        // sin uso
        return usuarioService.listarTodos();
    }

    // /api/usuarios/personal
    @GetMapping("/personal")
    public ResponseEntity<List<UsuarioDTO>> getPersonalCompleto() {
        // obtenemos personal sin datos extras
        List<UsuarioDTO> lista = usuarioService.obtenerTodoElPersonal();
        return ResponseEntity.ok(lista);
    }

    // /api/usuarios/actualizar/{id}
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarEmpleado(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        try {
            // envia id y dto objeto de usr
            usuarioService.actualizarUsuario(id, dto);

            return ResponseEntity.ok().body("{\"mensaje\": \"todo ok\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    //  Editar un propio perfil
    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> actualizarMiPerfil(@PathVariable Integer id, @RequestBody UsuarioDTO dto) {
        try {
            
            usuarioService.actualizarMiPerfil(id, dto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/cambiar-password/{id}")
    public ResponseEntity<?> actualizarPassword(@PathVariable Integer id, @RequestBody PasswordDTO dto) {
        try {
            // datoss vacios
            if (dto.getPasswordActual() == null || dto.getPasswordNueva() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Faltan datos de contraseña\"}");
            }

            // uso de dtopass y el servicio de cambio
            usuarioService.cambiarPassword(id, dto.getPasswordActual(), dto.getPasswordNueva());

            // exito
            return ResponseEntity.ok().body("{\"mensaje\": \"todo ok\"}");

        } catch (RuntimeException e) {
            // error
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

}