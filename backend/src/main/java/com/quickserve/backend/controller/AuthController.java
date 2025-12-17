package com.quickserve.backend.controller;

import com.quickserve.backend.model.User;
import com.quickserve.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; 

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = authService.registerNewUser(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        try {
            User loggedInUser = authService.loginUser(user.getUsername(), user.getPassword(), user.getRole());
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }
    

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            authService.forgotPassword(email);
            return new ResponseEntity<>("Reset link sent to your email.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        try {
            authService.resetPassword(token, newPassword);
            return new ResponseEntity<>("Password reset successfully. Please login.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }


    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            authService.sendRegistrationOtp(email);
            return new ResponseEntity<>("OTP sent to " + email, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        boolean isValid = authService.verifyRegistrationOtp(email, otp);
        if (isValid) {
            return new ResponseEntity<>("Email verified successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Incorrect OTP.", HttpStatus.BAD_REQUEST);
        }
    }
}