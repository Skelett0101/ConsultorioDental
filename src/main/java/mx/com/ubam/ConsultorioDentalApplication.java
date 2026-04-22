package mx.com.ubam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ConsultorioDentalApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConsultorioDentalApplication.class, args);
	}

}
