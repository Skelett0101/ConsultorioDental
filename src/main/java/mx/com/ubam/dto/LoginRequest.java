package mx.com.ubam.dto;

public class LoginRequest {
	// uso para el logeo de usuario
	// evita mandar todo los datos de un usuario sin ser necesarios
	// y es el formato del jso que se manejra para la entrada y salida
	// del front a back (solo en inicisio de seion)

	private String email;
	private String password;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
}