package mx.com.ubam.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    // R53, R54: Lógica para enviar el correo
    public void enviar(String destinatario, String asunto, String cuerpo) {
        System.out.println("Enviando correo a: " + destinatario);
        System.out.println("Asunto: " + asunto);
        System.out.println("Mensaje: " + cuerpo);
    }
}