package mx.com.ubam.dto;

public class LoginResponse {
	//con esta clase se manejra el token que tendra el usuario 
	// que solo permite ciertas acciones dependiendo de su rol
	// ademas que es lo que se manda el back en json y se usar para el uso de cualquier controlador
	
    private String token;
    private String email;
    private String nombre;
    private String apellido;
    private String rol;
    private Integer idUsuario;
    private Long expiraEn;
    
    // Getters y Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }
    
    public Long getExpiraEn() { return expiraEn; }
    public void setExpiraEn(Long expiraEn) { this.expiraEn = expiraEn; }
}