package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import mx.com.ubam.dto.*;
import mx.com.ubam.model.*;
import mx.com.ubam.repository.*;
import mx.com.ubam.security.JwtUtil;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        
        try {
            // validar datos null
            if (request.getEmail() == null || request.getPassword() == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Email y contraseña son requeridos");
                return ResponseEntity.badRequest().body(error);
            }
            
            // busqueda de usuario por email
            Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElse(null);
            
            if (usuario == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            if (!usuario.getActivo()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario desactivado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Contraseña incorrecta");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            // Generar token
            String token = jwtUtil.generarToken(
                usuario.getEmail(),
                usuario.getRol().getNombre(),
                usuario.getIdUsuario()
            );
            
            // Respuesta exitosa
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmail(usuario.getEmail());
            response.setNombre(usuario.getNombre());
            response.setApellido(usuario.getApellido());
            response.setRol(usuario.getRol().getNombre());
            response.setIdUsuario(usuario.getIdUsuario());
            response.setExpiraEn(8 * 60 * 60L);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}