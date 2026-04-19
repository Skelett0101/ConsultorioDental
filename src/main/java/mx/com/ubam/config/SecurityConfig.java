package mx.com.ubam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod; // 🔥 IMPORTANTE AGREGAR ESTO
import org.springframework.security.config.Customizer; // 🔥 IMPORTANTE AGREGAR ESTO
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import mx.com.ubam.security.JwtFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            //activar CORS correctamente para que lea tu clase CorsConfig
            .cors(Customizer.withDefaults()) 
            .csrf(csrf -> csrf.disable())

            // Sin sesion jwt
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // AUTORIZACIÓN
            .authorizeHttpRequests(auth -> auth
            
                // Dejar pasar las peticiones fantasma (Preflight) de los navegadores
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // donde se puede entrar sin credencial 
                .requestMatchers(
                		"/",
                    "/registro.html",
                    "/index.html",
                    "/assets/**",
                    "/calendario.html",
                    "/personal.html",
                    "/servicios.html",
                    "/pacientes.html",
                    "/dashboard.html",
                    "/index_paciente.html",
                    "/serviciosIndex.html",
                    "/nosotros.html",
                    "/css/**",
                    "/js/**",
                    "/error"
                ).permitAll()

                //crear pacientes
                .requestMatchers(HttpMethod.POST, "/api/pacientes").permitAll()
                
                // login y registro
                .requestMatchers("/auth/login", "/api/usuarios/registro").permitAll()
                
                //disponible admin, recep,dentista
                .requestMatchers("/api/citas/registrar", "/api/citas/listar", "/api/citas/eliminar").hasAnyRole("admin")
                
               // citas admin
                .requestMatchers("/api/citas/registrar", "/api/citas/listar", "/api/citas/eliminar").hasAnyRole("admin")
                
                // citas recepcionista
                .requestMatchers("/api/citas/registrar", "/api/citas/listar", "/api/citas/editar").hasAnyRole("recepcionista")
                
             // citas dentista
                .requestMatchers("/api/citas/listar").hasAnyRole("dentista")

                // solo admin
                .requestMatchers("/api/usuarios/**").hasRole("admin")

                // admin y recepcion
                .requestMatchers("/api/pacientes/crear", "/api/pacientes/editar")
                    .hasAnyRole("admin", "recepcionista")

                // dr 
                .requestMatchers("/api/citas/mis-citas")
                    .hasRole("dentista")

                // los usuarios logueados
                .requestMatchers("/api/perfil/**").authenticated()

             // 1. Los reportes financieros
             .requestMatchers("/api/pagos/ingresos/**").hasRole("admin")

             // 2. El resto de funciones (cobrar, ver recibos)
             .requestMatchers("/api/pagos/**").hasAnyRole("admin", "recepcionista")

             // 🔹 REGLAS DE PERFIL
             .requestMatchers("/api/perfil/**").authenticated()
                
                // cualquier otra
                .anyRequest().authenticated()
                
            )

            // filtro
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // BCrypt (para passwords)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}