package mx.com.ubam.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.*;
import jakarta.persistence.Table;

@Entity
@Table(name = "CITA")
public class Cita {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_cita;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dentista", nullable = false)
    private Usuario dentista;
	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;
	
	private LocalDateTime fecha_hora;
	
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
		return id_cita;
	}

	public void setId_cita(Integer id_cita) {
		this.id_cita = id_cita;
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

	public LocalDateTime getFecha_hora() {
		return fecha_hora;
	}

	public void setFecha_hora(LocalDateTime fecha_hora) {
		this.fecha_hora = fecha_hora;
	}

	public String getEstado() {
		return estadoCita;
	}

	public void setEstado(String estado) {
		this.estadoCita = estado;
	}

	public String getNotaCita() {
		return notaCita;
	}

	public void setNotaCita(String notaCita) {
		this.notaCita = notaCita;
	}

	public LocalDateTime getFecha_creacion() {
		return fecha_creacion;
	}

	public void setFecha_creacion(LocalDateTime fecha_creacion) {
		this.fecha_creacion = fecha_creacion;
	}
	
	
	
}
