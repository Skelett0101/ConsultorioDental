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
@Table(name = "Cita")
public class Cita {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCita;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dentista", nullable = false)
    private Usuario dentista;
	
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio", nullable = false)
    private Servicio servicio;
	
    @Column(name = "fecha_hora") // Opcional: define el nombre en la DB
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

	public void setId_cita(Integer id_cita) {
		this.idCita = id_cita;
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
		return fechaHora;
	}

	public void setFecha_hora(LocalDateTime fecha_hora) {
		this.fechaHora = fecha_hora;
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
