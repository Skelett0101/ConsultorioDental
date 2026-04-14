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
	private Long id_dentista;
	
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dia_semana", nullable = false)
	private Long diaSemana;
	
	@Column(name = "hora_inicio")
	private LocalTime horaInicio;
	
	@Column(name = "hora_fin")
	private LocalTime horaFin;
	
	@JoinColumn(name = "activo", nullable = false)
	private Long activoDispo;
	

}
