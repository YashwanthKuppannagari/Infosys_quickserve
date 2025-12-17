package com.quickserve.backend.controller;

import com.quickserve.backend.model.Service;
import com.quickserve.backend.service.ServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*") 
@RestController
@RequestMapping("/api/services") 
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @GetMapping
    public ResponseEntity<?> getAllServices() {
        try {
            List<Service> services = serviceService.getAllServices();
            return new ResponseEntity<>(services, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

   
    @PostMapping
    public ResponseEntity<?> createService(@RequestBody Service service) {
        try {
            Service newService = serviceService.createService(service);
            return new ResponseEntity<>(newService, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

   
    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(@PathVariable Long serviceId, @RequestBody Service serviceDetails) {
        try {
            Service updatedService = serviceService.updateService(serviceId, serviceDetails);
            return new ResponseEntity<>(updatedService, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    
    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(@PathVariable Long serviceId) {
        try {
            serviceService.deleteService(serviceId);
            return new ResponseEntity<>("Service deleted successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}