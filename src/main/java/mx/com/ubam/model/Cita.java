package mx.com.ubam.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@Entity
@Table(name = "Cita")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cita {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCita;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JsonAlias({"id_paciente", "idPaciente"})
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dentista", nullable = false)
    private Usuario dentista;
	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;
	
    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;
	
    @Column(name = "estado") 
    private String estadoCita;
	
	@Column(name = "notas", nullable = false)
	private String notaCita;
	
	private LocalDateTime fecha_creacion;
	
	// Getters y Setters
	

	public Paciente getPaciente() {
		return paciente;
	}

	public Integer getId_cita() {
		return idCita;
	}

	public void setId_cita(Integer idCita) {
		this.idCita = idCita;
	}

	public void setPaciente(Paciente paciente) {
		this.paciente = paciente;
	}

	public Usuario getDentista() {
		return dentista;
	}

	public void setDentista(Usuario dentista) {
		this.dentista = dentista;
	}

	public Servicio getServicio() {
		return servicio;
	}

	public void setServicio(Servicio servicio) {
		this.servicio = servicio;
	}

	public String getEstadoCita() {
		return estadoCita;
	}

	public void setEstadoCita(String estadoCita) {
		this.estadoCita = estadoCita;
	}

	public LocalDateTime getFechaHora() {
		return fechaHora;
	}

	public void setFechaHora(LocalDateTime fechaHora) {
		this.fechaHora = fechaHora;
	}


	public String getNotaCita() {
		return notaCita;
	}

	public void setNotaCita(String notaCita) {
		this.notaCita = notaCita;
	}

	public LocalDateTime getFechaCreacion() {
		return fecha_creacion;
	}

	public void setFechaCreacion(LocalDateTime fecha_creacion) {
		this.fecha_creacion = fecha_creacion;
	}
	
	
	
}
