package com.quickserve.backend.config;

import com.quickserve.backend.model.User;
import com.quickserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (userRepository.findByUsername("admin") == null) {
           
            User admin = new User();
            
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setRole("Admin");
            admin.setFullName("Administrator");
            admin.setEmail("admin@quickserve.com");
            admin.setPhoneNumber("0000000000");

            userRepository.save(admin);
            
            System.out.println(">>> Default Admin user 'admin' created with password 'admin123'");
        } else {
            System.out.println(">>> Admin user already exists. Skipping creation.");
        }
    }
}