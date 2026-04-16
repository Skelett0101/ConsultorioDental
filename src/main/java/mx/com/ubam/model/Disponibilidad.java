package mx.com.ubam.model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "DISPONIBILIDAD")
public class Disponibilidad {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_disponibilidad;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dentista", nullable = false)
	private Usuario dentista;
	
	
    @Column(name = "dia_semana", nullable = false)
	private Long diaSemana;
	
	@Column(name = "hora_inicio")
	private LocalTime horaInicio;
	
	@Column(name = "hora_fin")
	private LocalTime horaFin;
	
	@JoinColumn(name = "activo", nullable = false)
	private Long activo;

	

	public Long getId_disponibilidad() {
		return id_disponibilidad;
	}

	public void setId_disponibilidad(Long idDisponibilidad) {
		this.id_disponibilidad = idDisponibilidad;
	}

	public Usuario getDentista() {
		return dentista;
	}

	public void setDentista(Usuario dentista) {
		this.dentista = dentista;
	}

	public Long getDiaSemana() {
		return diaSemana;
	}

	public void setDiaSemana(Long diaSemana) {
		this.diaSemana = diaSemana;
	}

	public LocalTime getHoraInicio() {
		return horaInicio;
	}

	public void setHoraInicio(LocalTime horaInicio) {
		this.horaInicio = horaInicio;
	}

	public LocalTime getHoraFin() {
		return horaFin;
	}

	public void setHoraFin(LocalTime horaFin) {
		this.horaFin = horaFin;
	}

	public Long getActivoDispo() {
		return activo;
	}

	public void setActivoDispo(Long activoDispo) {
		this.activo = activoDispo;
	}
	

	
	
}
