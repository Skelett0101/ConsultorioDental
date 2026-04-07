package mx.com.ubam.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {
    
	
	// inyeccion de otra clase 
    @Autowired
    private JwtUtil jwtUtil;
    
    
    
    // Leer el token del request
    // Validarlo
    // Decirle a Spring quién es el usuario
    // Asignar su rol
    
    
    // ejecucuion de este metodod en cada GET, POST,PUT (consumo api rest controlador)
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        
    	// lee el heder 
        String authHeader = request.getHeader("Authorization");
        
        
        // valida el formato que maneja jwt 
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // obtiene datos sin consultar la bd 
            if(jwtUtil.validarToken(token)) {
                String email = jwtUtil.extraerEmail(token);
                String rol = jwtUtil.extraerRol(token);
                Integer idUsuario = jwtUtil.extraerIdUsuario(token);
                
                
                // crea el objeto de autenticacion y spring sepa quien es 
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + rol))
                    );
                
                // se gurada y divce el usuario es válido y está autenticado
                SecurityContextHolder.getContext().setAuthentication(auth);
                request.setAttribute("usuarioId", idUsuario);
            }
        }
        
        chain.doFilter(request, response);
    }
}