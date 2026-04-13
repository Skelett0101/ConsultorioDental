package mx.com.ubam.controller;

import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import jakarta.servlet.http.HttpServletResponse;
import mx.com.ubam.model.Cita; 
import mx.com.ubam.repository.CitaRepository; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List; 
@RestController
@RequestMapping("/reportes")
public class ReporteController {

    @Autowired 
    private CitaRepository citaRepository; 

    @GetMapping("/citas/pdf")
    public void exportarPDF(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_citas.pdf");

        PdfWriter writer = new PdfWriter(response.getOutputStream());
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        document.add(new Paragraph("Clinical Atelier - Reporte de Citas").setBold().setFontSize(18));
        document.add(new Paragraph("Generado el: " + java.time.LocalDateTime.now()));
        document.add(new Paragraph("\n"));

        // R39: Obtener datos reales de la base de datos
        List<Cita> citas = citaRepository.findAll();

        for (Cita c : citas) {
            document.add(new Paragraph(
                "Fecha: " + c.getFechaHora() + 
                " | Paciente: " + c.getPaciente().getNombrePaciente() + 
                " | Servicio: " + c.getServicio().getNombreServicio()
            ));
        }
        
        document.close();
    }
}