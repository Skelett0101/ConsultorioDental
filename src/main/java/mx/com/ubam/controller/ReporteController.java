package mx.com.ubam.controller;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import mx.com.ubam.model.Cita;
import mx.com.ubam.service.CitaService;
import mx.com.ubam.model.Pago;
import mx.com.ubam.repository.PagoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class ReporteController {

    @Autowired
    private CitaService Citaser;

    @Autowired
    private PagoRepository pagoRepo;

    @GetMapping("/reportes/citas/pdf")
    public ResponseEntity<byte[]> generarPdfAgendaGeneral() {
        try {
            List<Cita> citas = Citaser.mostrarTodo(PageRequest.of(0, 1000)).getContent();
            byte[] pdfBytes = generarPdf(citas, "Agenda General de Citas - Clinical Atelier");
            return crearRespuestaPdf(pdfBytes, "Agenda_General.pdf");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/reportes/agenda-semanal/pdf")
    public ResponseEntity<byte[]> generarPdfAgendaSemanal(
            @RequestParam(required = false) String inicio,
            @RequestParam(required = false) String fin) {
        try {
            List<Cita> citas = Citaser.mostrarTodo(PageRequest.of(0, 1000)).getContent();

            if (inicio != null && fin != null) {
                LocalDate fechaInicio = LocalDate.parse(inicio);
                LocalDate fechaFin = LocalDate.parse(fin);
                
                citas = citas.stream().filter(c -> {
                    if (c.getFechaHora() == null) return false;
                    LocalDate fechaCita = c.getFechaHora().toLocalDate();
                    return !fechaCita.isBefore(fechaInicio) && !fechaCita.isAfter(fechaFin);
                }).collect(Collectors.toList());
            }

            String titulo = (inicio != null && fin != null) ? "Agenda Semanal (" + inicio + " al " + fin + ")" : "Agenda Semanal";
            byte[] pdfBytes = generarPdf(citas, titulo);
            
            return crearRespuestaPdf(pdfBytes, "Agenda_Semanal.pdf");
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/reportes/pagos/pdf")
    @Transactional(readOnly = true)
    public ResponseEntity<byte[]> generarPdfPagos() {
        try {
            List<Pago> pagos = pagoRepo.findAll();
            byte[] pdfBytes = generarPdfDePagos(pagos, "Historial General de Pagos");
            return crearRespuestaPdf(pdfBytes, "Historial_Pagos.pdf");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private byte[] generarPdfDePagos(List<Pago> pagos, String tituloTexto) throws Exception {
        Document document = new Document(PageSize.A4.rotate()); 
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new BaseColor(0, 93, 144));
        Paragraph titulo = new Paragraph(tituloTexto, fontTitulo);
        titulo.setAlignment(Element.ALIGN_CENTER);
        document.add(titulo);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 3.5f, 3f, 3.5f, 2.5f, 2f, 2f});

        Font fontCabecera = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        String[] cabeceras = {"Ticket", "Paciente", "Doctor", "Servicio", "Fecha", "Método", "Monto"};
        
        for (String cabecera : cabeceras) {
            PdfPCell cell = new PdfPCell(new Phrase(cabecera, fontCabecera));
            cell.setBackgroundColor(new BaseColor(0, 93, 144));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(7);
            table.addCell(cell);
        }

        Font fontDatos = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.DARK_GRAY);
        DateTimeFormatter formatoFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (Pago p : pagos) {
            String ticket = p.getIdPago() != null ? String.valueOf(p.getIdPago()) : "S/N";
            String paciente = "Desconocido";
            String doctor = "No asignado";
            String servicio = "General";
            
            if (p.getCita() != null) {
                if (p.getCita().getPaciente() != null) {
                    paciente = p.getCita().getPaciente().getNombrePaciente() + " " + p.getCita().getPaciente().getApellidoPaciente();
                }
                if (p.getCita().getDentista() != null) {
                    doctor = "Dr. " + p.getCita().getDentista().getNombre() + " " + p.getCita().getDentista().getApellido();
                }
                if (p.getCita().getServicio() != null) {
                    servicio = p.getCita().getServicio().getNombreServicio() != null ? p.getCita().getServicio().getNombreServicio() : "General";
                }
            }
            
            String fecha = p.getFechaPago() != null ? p.getFechaPago().format(formatoFecha) : "---";
            String metodo = p.getMetodoPago() != null ? p.getMetodoPago().toUpperCase() : "N/A";
            String monto = p.getMonto() != null ? "$" + p.getMonto() : "$0.00";

            table.addCell(new PdfPCell(new Phrase(ticket, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(paciente, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(doctor, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(servicio, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(fecha, fontDatos)));
            
            PdfPCell celdaMetodo = new PdfPCell(new Phrase(metodo, fontDatos));
            celdaMetodo.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(celdaMetodo);
            
            PdfPCell celdaMonto = new PdfPCell(new Phrase(monto, fontDatos));
            celdaMonto.setHorizontalAlignment(Element.ALIGN_RIGHT);
            table.addCell(celdaMonto);
        }

        document.add(table);
        
        Paragraph footer = new Paragraph("\nDocumento generado el: " + LocalDate.now(), 
            FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.LIGHT_GRAY));
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private byte[] generarPdf(List<Cita> citas, String tituloTexto) throws Exception {
        
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);

        document.open();

        Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, new BaseColor(0, 93, 144));
        Paragraph titulo = new Paragraph(tituloTexto, fontTitulo);
        titulo.setAlignment(Element.ALIGN_CENTER);
        document.add(titulo);
        document.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.2f, 3.5f, 2.5f, 3f, 2.5f, 3.5f, 2f});

        Font fontCabecera = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        String[] cabeceras = {"Folio", "Paciente", "Teléfono", "Doctor", "Fecha/Hora", "Tratamiento", "Estado"};
        
        for (String cabecera : cabeceras) {
            PdfPCell cell = new PdfPCell(new Phrase(cabecera, fontCabecera));
            cell.setBackgroundColor(new BaseColor(0, 93, 144));
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(7);
            table.addCell(cell);
        }

        Font fontDatos = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.DARK_GRAY);
        DateTimeFormatter formatoFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (Cita c : citas) {
            String folio = c.getId_cita() != null ? String.valueOf(c.getId_cita()) : "S/N";
            String nomPac = "Sin nombre";
            String telPac = "N/A";
            
            if (c.getPaciente() != null) {
                nomPac = c.getPaciente().getNombrePaciente() + " " + c.getPaciente().getApellidoPaciente();
                telPac = c.getPaciente().getTelefonoPaciente() != null ? c.getPaciente().getTelefonoPaciente() : "N/A";
            }
            
            String nomDoc = c.getDentista() != null ? "Dr. " + c.getDentista().getNombre() + " " + c.getDentista().getApellido() : "Sin Asignar";
            String fecha = c.getFechaHora() != null ? c.getFechaHora().format(formatoFecha) : "---";
            
            String tratamiento = "Consulta";
            if (c.getServicio() != null) {
                tratamiento = c.getServicio().getNombreServicio() != null ? c.getServicio().getNombreServicio() : "Consulta";
            }
            
            String estado = c.getEstadoCita() != null ? c.getEstadoCita().toUpperCase() : "PENDIENTE";

            table.addCell(new PdfPCell(new Phrase(folio, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(nomPac, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(telPac, fontDatos))); 
            table.addCell(new PdfPCell(new Phrase(nomDoc, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(fecha, fontDatos)));
            table.addCell(new PdfPCell(new Phrase(tratamiento, fontDatos)));
            
            PdfPCell celdaEstado = new PdfPCell(new Phrase(estado, fontDatos));
            celdaEstado.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(celdaEstado);
        }

        document.add(table);
        
        Paragraph footer = new Paragraph("\nDocumento generado el: " + LocalDate.now(), 
            FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.LIGHT_GRAY));
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private ResponseEntity<byte[]> crearRespuestaPdf(byte[] pdfBytes, String nombreArchivo) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", nombreArchivo);
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}