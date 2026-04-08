package mx.com.ubam.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "PACIENTE")
public class Paciente {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_paciente;
	
	@Column(name = "nombre_paciente", nullable = false)
	private String nombrePaciente;

	@Column(name = "apellido_paciente", nullable = false)
	private String apellidoPaciente;
	
	@Column(name = "email_paciente",unique = true)
	private String emailPaciente;
	
	@Column(name = "telefono_paciente", nullable = false)
	private String telefonoPaciente;
	
	private LocalDateTime fecha_registro;

	//getters y setters 
	public Long getId_paciente() {
		return id_paciente;
	}

	public void setId_paciente(Long id_paciente) {
		this.id_paciente = id_paciente;
	}

	public String getNombrePaciente() {
		return nombrePaciente;
	}

	public void setNombrePaciente(String nombrePaciente) {
		this.nombrePaciente = nombrePaciente;
	}

	public String getApelllidoPaciente() {
		return apellidoPaciente;
	}

	public void setApelllidoPaciente(String apelllidoPaciente) {
		this.apellidoPaciente = apelllidoPaciente;
	}

	public String getEmailPaciente() {
		return emailPaciente;
	}

	public void setEmailPaciente(String emailPaciente) {
		this.emailPaciente = emailPaciente;
	}

	public String getTelefonoPaciente() {
		return telefonoPaciente;
	}

	public void setTelefonoPaciente(String telefonoPaciente) {
		this.telefonoPaciente = telefonoPaciente;
	}

	public LocalDateTime getFecha_registro() {
		return fecha_registro;
	}

	public void setFecha_registro(LocalDateTime fecha_registro) {
		this.fecha_registro = fecha_registro;
	}

	
	
}
