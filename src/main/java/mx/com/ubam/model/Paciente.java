package mx.com.ubam.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "PACIENTE")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Integer idPaciente;
    
    @Column(name = "nombre_paciente", nullable = false)
    private String nombrePaciente;

    @Column(name = "apellido_paciente", nullable = false)
    private String apellidoPaciente;
    
    @Column(name = "email_paciente",unique = true)
    private String emailPaciente;
    
    @Column(name = "telefono_paciente", nullable = false)
    private String telefonoPaciente;
    
    @Column(name = "fecha_cita")
    private LocalDateTime fechaCita;

    //getters y setters 
    
    public Integer getIdPaciente() {
		return idPaciente;
	}

	public void setIdPaciente(Integer idPaciente) {
		this.idPaciente = idPaciente;
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

	public LocalDateTime getFechaCita() {
		return fechaCita;
	}

	public void setFechaCita(LocalDateTime fechaCita) {
		this.fechaCita = fechaCita;
	}

    
}