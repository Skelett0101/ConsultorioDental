package mx.com.ubam.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "PACIENTE")
public class Paciente {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_paciente;
	
	@Column(name = "nombre_paciente", nullable = false)
	private String nombrePaciente;

	@Column(name = "apellido_paciente", nullable = false)
	private String apellidoPaciente;
	
	@Column(name = "email_paciente",unique = true)
	private String emailPaciente;
	
	@Column(name = "telefono_paciente", nullable = false)
	private String telefonoPaciente;
	
	@Column(name = "fecha_cita")
	private LocalDateTime fecha_cita;

	//getters y setters 
	public Integer getId_paciente() {
		return id_paciente;
	}

	public void setId_paciente(Integer id_paciente) {
		this.id_paciente = id_paciente;
	}

	public String getNombrePaciente() {
		return nombrePaciente;
	}

	public void setNombrePaciente(String nombrePaciente) {
		this.nombrePaciente = nombrePaciente;
	}

	public String getApellidoPaciente() {
		return apellidoPaciente;
	}

	public void setApellidoPaciente(String apellidoPaciente) {
		this.apellidoPaciente = apellidoPaciente;
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

	public LocalDateTime getFecha_cita() {
		return fecha_cita;
	}

	public void setFecha_cita(LocalDateTime fecha_cita) {
		this.fecha_cita = fecha_cita;
	}

	
	
}
