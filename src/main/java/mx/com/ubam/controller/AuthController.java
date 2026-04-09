package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import mx.com.ubam.dto.*;
import mx.com.ubam.model.*;
import mx.com.ubam.repository.*;
import mx.com.ubam.security.JwtUtil;

@RestController  //  clase que expone endpoints las rest pues
@RequestMapping("/auth")  // prefijo de la ruta /
@CrossOrigin(origins = "*")
public class AuthController {
    
	
	// inyeccion de otras clases para su manejo 
    @Autowired
    private UsuarioRepository usuarioRepository; // accede a la bd busca el user 
    
    @Autowired
    private PasswordEncoder passwordEncoder; // compara contraseñas como: tovarEslaOnda123
    
    @Autowired
    private JwtUtil jwtUtil; // genera y valida el token de jwt jijija
    
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        
    	//valida si el usuario esta en la bd 
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if(!usuario.getActivo()) {
            throw new RuntimeException("Usuario desactivado");
        }
        
        
        if(passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            
        	// genera el token para la respuetas
            String token = jwtUtil.generarToken(
                usuario.getEmail(),
                usuario.getRol().getNombre(),
                usuario.getIdUsuario()
            );
            
            //genera la respuesta para el back 
            LoginResponse response = new LoginResponse();
            response.setToken(token);
            response.setEmail(usuario.getEmail());
            response.setNombre(usuario.getNombre());
            response.setApellido(usuario.getApellido());
            response.setRol(usuario.getRol().getNombre());
            response.setIdUsuario(usuario.getIdUsuario());
            response.setExpiraEn(8 * 60 * 60L);
            
            return response;
        }
        
        throw new RuntimeException("Contraseña incorrecta");
    }
}