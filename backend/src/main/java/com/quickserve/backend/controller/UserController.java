package com.quickserve.backend.controller;

import com.quickserve.backend.model.User;
import com.quickserve.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody User userDetails) {
        try {
            User updatedUser = userService.updateUser(userId, userDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/{userId}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        try {
            userService.uploadProfilePicture(userId, file);
            return new ResponseEntity<>("Image uploaded successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{userId}/image")
    public ResponseEntity<?> getImage(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            if (user.getProfilePicture() == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(user.getProfilePictureType()))
                    .body(user.getProfilePicture());
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/{userId}/wallet")
    public ResponseEntity<?> getWalletBalance(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            Double balance = user.getWalletBalance() == null ? 0.0 : user.getWalletBalance();
            return new ResponseEntity<>(balance, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{userId}/withdraw")
    public ResponseEntity<?> withdrawFunds(@PathVariable Long userId) {
        try {
            Double amount = userService.withdrawFunds(userId);
            return new ResponseEntity<>("Successfully withdrew ₹" + amount, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/forgot-password") 
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        try {
            userService.generateAndSendOtp(email);
            return ResponseEntity.ok("OTP sent successfully to " + email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/reset-password") 
    public ResponseEntity<String> resetPassword(@RequestParam String email, 
                                                @RequestParam String token, 
                                                @RequestParam String password) {
        try {
            userService.resetPassword(email, token, password); 
            return ResponseEntity.ok("Password updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
}
