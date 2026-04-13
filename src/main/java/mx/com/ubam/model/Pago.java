package mx.com.ubam.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pago")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "id_cita", unique = true, nullable = false)
    private Cita cita;

    @Column(nullable = false)
    private Double monto;

    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago; 

    @Column(name = "ultimos_4_digitos", length = 4)
    private String ultimosCuatro; 

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "id_usuario_registra", nullable = false)
    private Usuario usuarioRegistra;

    // --- GETTERS Y SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cita getCita() { return cita; }
    public void setCita(Cita cita) { this.cita = cita; }
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    public String getUltimosCuatro() { return ultimosCuatro; }
    public void setUltimosCuatro(String ultimosCuatro) { this.ultimosCuatro = ultimosCuatro; }
    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
    public Usuario getUsuarioRegistra() { return usuarioRegistra; }
    public void setUsuarioRegistra(Usuario usuarioRegistra) { this.usuarioRegistra = usuarioRegistra; }
}