package mx.com.ubam.model;

import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "SERVICIO")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "nombre", nullable = false)
    private String nombreServicio;

    //se uso bigdecimal por temas de precision y exactitud
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioServicio;

    //se pone en true para que los servicios se registren como activos por defecto
    @Column(name = "activo")
    private Boolean activoServicio = true;

    //getters y setters
	public Long getIdServicio() {
		return idServicio;
	}

	public void setIdServicio(Long idServicio) {
		this.idServicio = idServicio;
	}

    public String getNombreServicio() {
        return nombreServicio;
    }

    public void setNombreServicio(String nombreServicio) {
        this.nombreServicio = nombreServicio;
    }

    public BigDecimal getPrecioServicio() {
        return precioServicio;
    }

    public void setPrecioServicio(BigDecimal precioServicio) {
        this.precioServicio = precioServicio;
    }

    public Boolean getActivoServicio() {
        return activoServicio;
    }

    public void setActivoServicio(Boolean activoServicio) {
        this.activoServicio = activoServicio;
    }
}