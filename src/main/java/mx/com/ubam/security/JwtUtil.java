package mx.com.ubam.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

// uso de la clase en todo el proyceto 
@Component
public class JwtUtil {
    
	
	// variables de la class que obtiene del aplicaction 
	
	// var de clave secreto (firma digital)
    @Value("${jwt.secret}")
    private String secret;
    
    // var de expiracion del toktn 
    @Value("${jwt.expiration}")
    private Long expiration;
    
    // Convierte el String secreto en una clave criptográfica real
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generarToken(String email, String rol, Integer idUsuario) {
        return Jwts.builder()
            .setSubject(email)
            .claim("rol", rol)
            .claim("idUsuario", idUsuario)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getKey())
            .compact();
    }
    
    public Boolean validarToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expirado");
            return false;
        } catch (JwtException e) {
            System.out.println("Token inválido");
            return false;
        }
    }
    
    public String extraerEmail(String token) {
        return getClaims(token).getSubject();
    }
    
    public String extraerRol(String token) {
        return getClaims(token).get("rol", String.class);
    }
    
    public Integer extraerIdUsuario(String token) {
        return getClaims(token).get("idUsuario", Integer.class);
    }
    
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}