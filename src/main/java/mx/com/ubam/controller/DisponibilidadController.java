package mx.com.ubam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import mx.com.ubam.model.*;

import mx.com.ubam.repository.*;

@Controller
public class DisponibilidadController {
	@Autowired
	private DisponibilidadRepository dispoRepo;

	
	

}
