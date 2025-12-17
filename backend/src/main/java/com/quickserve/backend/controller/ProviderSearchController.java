package com.quickserve.backend.controller;

import com.quickserve.backend.model.User;
// *** IMPORTANT: You might need to rename AuthService depending on where you put the search logic ***
// *** If you put findProvidersByCriteria in AuthService, import that. ***
// *** If you create a new ProviderService, import that instead. ***
import com.quickserve.backend.service.AuthService; // Assuming search logic is added here for now
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/providers") 
public class ProviderSearchController {


    @Autowired
    private AuthService authService;
    @GetMapping("/search")
    public List<User> searchProviders(
            @RequestParam String service,    
            @RequestParam String location,  
            @RequestParam String date,       
            @RequestParam String time) {     

        List<User> matchingProviders = authService.findProvidersByCriteria(service, location);

        return matchingProviders;
    }
}