package mx.com.ubam.dto;

public class DisponibleDTO {

	private Integer idDentista;
    private String nombreDentista;
    private String hora;
    
    
    
    
    
	public DisponibleDTO(Integer idDentista, String nombreDentista, String hora) {
		super();
		this.idDentista = idDentista;
		this.nombreDentista = nombreDentista;
		this.hora = hora;
	}
	public Integer getIdDentista() {
		return idDentista;
	}
	public void setIdDentista(Integer idDentista) {
		this.idDentista = idDentista;
	}
	public String getNombreDentista() {
		return nombreDentista;
	}
	public void setNombreDentista(String nombreDentista) {
		this.nombreDentista = nombreDentista;
	}
	public String getHora() {
		return hora;
	}
	public void setHora(String hora) {
		this.hora = hora;
	}
    
    
}
