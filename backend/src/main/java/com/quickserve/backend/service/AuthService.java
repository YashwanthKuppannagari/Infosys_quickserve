package com.quickserve.backend.service;

import com.quickserve.backend.model.User;
import com.quickserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; 
    
    @Autowired
    private EmailService emailService;

    
    private Map<String, String> otpStorage = new HashMap<>();

    
    public void sendRegistrationOtp(String email) throws Exception {
        
        if (userRepository.findByEmail(email) != null) {
            throw new Exception("Email already exists. Please login.");
        }

        
        String otp = String.format("%04d", new Random().nextInt(10000));
        
        
        otpStorage.put(email, otp);

        
        String subject = "Verify your Email - QuickServe";
        String body = "Your verification code is: " + otp + "\n\n" +
                      "This code is valid for registration.";
                      
        emailService.sendSimpleEmail(email, subject, body);
    }

    
    public boolean verifyRegistrationOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // Clear after use
            return true;
        }
        return false;
    }

   
    public User registerNewUser(User registrationData) throws Exception {
        if (userRepository.findByUsername(registrationData.getUsername()) != null) {
            throw new Exception("Username already exists.");
        }
    
        if (userRepository.findByEmail(registrationData.getEmail()) != null) {
            throw new Exception("Email already exists.");
        }

        User newUser = new User();
        newUser.setUsername(registrationData.getUsername());
        newUser.setPassword(passwordEncoder.encode(registrationData.getPassword())); 
        newUser.setRole(registrationData.getRole());
        newUser.setFullName(registrationData.getFullName());
        newUser.setPhoneNumber(registrationData.getPhoneNumber());
        newUser.setEmail(registrationData.getEmail());
        
        if ("Provider".equalsIgnoreCase(registrationData.getRole())) {
            newUser.setServicesProvided(registrationData.getServicesProvided()); 
            newUser.setOperatingLocation(registrationData.getOperatingLocation());
            newUser.setAge(registrationData.getAge());
            newUser.setHighestQualification(registrationData.getHighestQualification());
            newUser.setCollegeName(registrationData.getCollegeName());
            newUser.setPercentage(registrationData.getPercentage());
            newUser.setYearsOfExperience(registrationData.getYearsOfExperience());
            newUser.setProviderAddress(registrationData.getProviderAddress());
            newUser.setAccountStatus("PENDING");
        } else {
            newUser.setAccountStatus("APPROVED");
        }
        
        User savedUser = userRepository.save(newUser);

      
        new Thread(() -> {
            emailService.sendSimpleEmail(savedUser.getEmail(), "Welcome to QuickServe!", "Thank you for registering.");
        }).start();
        
        return savedUser;
    }
    
    
    public User loginUser(String username, String password, String role) throws Exception {
        User user = userRepository.findByUsername(username);
        if (user == null) throw new Exception("User not registered.");
        if (!passwordEncoder.matches(password, user.getPassword())) throw new Exception("Invalid credentials.");
        if (!user.getRole().equalsIgnoreCase(role)) throw new Exception("Invalid role.");
        if ("Provider".equalsIgnoreCase(user.getRole())) {
            if ("PENDING".equalsIgnoreCase(user.getAccountStatus())) throw new Exception("Registration is submitted and under the process.");
            if ("REJECTED".equalsIgnoreCase(user.getAccountStatus())) throw new Exception("sorry, you are not eligible for doing service and declined.");
        }
        return user;
    }

    public List<User> findProvidersByCriteria(String service, String location) {
        List<User> approvedProviders = userRepository.findByRoleAndOperatingLocationAndServicesProvidedContainingIgnoreCase("Provider", location, service);
        return approvedProviders.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getAccountStatus())).collect(java.util.stream.Collectors.toList());
    }
    
    public void forgotPassword(String email) throws Exception { /* Keep existing logic */ }
    public void resetPassword(String token, String newPassword) throws Exception { /* Keep existing logic */ }
}