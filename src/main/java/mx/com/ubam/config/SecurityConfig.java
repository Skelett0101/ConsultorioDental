package mx.com.ubam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer; 
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
                    "/perfil.html",
                    "/css/**",
                    "/js/**",
                    "/error"
                ).permitAll()

                //crear pacientes
                .requestMatchers(HttpMethod.POST, "/api/pacientes").permitAll()
                
                //para que el usuario pueda registrar su cita
                .requestMatchers(HttpMethod.POST, "/api/citas/registrar").permitAll()

             // login y registro
                .requestMatchers("/auth/login", "/api/usuarios/registro").permitAll()
                
                .requestMatchers(HttpMethod.GET, "/api/servicios").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/disponibilidad/horariosDisponibles").permitAll()

                
                //editar pacientes (admin y recepcionsita)
                .requestMatchers(HttpMethod.PUT, "/api/pacientes/**").hasAnyRole("admin", "recepcionista")
                //editar perfil propio passwd
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/cambiar-password/{id}").hasAnyRole("admin", "recepcionista", "dentista")
                //editar perfil propio
                .requestMatchers("/api/usuarios/perfil/**").authenticated()
                
                //listar activos (admin, recepcionsita y dentista)
                .requestMatchers(HttpMethod.GET, "/api/servicios").hasAnyRole("admin", "recepcionista", "dentista")
                
                //mostrar citas todos
                .requestMatchers("/api/citas/listar").hasAnyRole("admin", "recepcionista", "dentista")

                //registrarsolo dos
                .requestMatchers("/api/citas/registrar").hasAnyRole("admin", "recepcionista")
                
                //eliminar admin
                .requestMatchers("/api/citas/eliminar").hasAnyRole("admin")                
             //
                .requestMatchers(HttpMethod.GET, "/api/usuarios/disponibilidad/mia").hasAnyRole("dentista", "admin", "recepcionista")

                .requestMatchers(HttpMethod.GET, "/api/citas/contadorsemanas").hasAnyRole("admin", "recepcionista", "dentista")

             .requestMatchers(HttpMethod.GET, "/api/usuarios").hasAnyRole("admin", "recepcionista", "dentista")
                
                //buscar
                .requestMatchers("/api/servicios/buscar").hasAnyRole("admin", "recepcionista", "dentista")
                
             // citas dentista
                .requestMatchers("/api/citas/listar").hasAnyRole("dentista")
                
                //personal
                .requestMatchers( "/api/usuarios/personal").hasAnyRole("admin")
                
                // l resto de funciones (cobrar, ver recibos)
                .requestMatchers("/api/pagos/**").hasAnyRole("admin", "recepcionista")
                //crear servicios
                .requestMatchers(HttpMethod.POST, "/api/servicios").hasRole("admin")
                
                
                //editar informacion
                .requestMatchers(HttpMethod.PUT, "/api/servicios/**").hasRole("admin")
                
                //desactivar servicios
                .requestMatchers(HttpMethod.DELETE, "/api/servicios/**").hasRole("admin")
                
                //activar servicios
                .requestMatchers(HttpMethod.PATCH, "/api/servicios/*/activar").hasRole("admin")
                
                //ver lista completa de usuarios (incluso inactivos)
                .requestMatchers("/api/servicios/todos").hasRole("admin")

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

             // Los reportes financieros
             .requestMatchers("/api/pagos/ingresos/**").hasRole("admin")

             // REGLAS DE PERFIL
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