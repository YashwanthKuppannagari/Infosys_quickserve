package com.quickserve.backend.controller;

import com.quickserve.backend.dto.AdminStatsDTO;
import com.quickserve.backend.dto.BookingResponseDTO; // Import
import com.quickserve.backend.model.User;
import com.quickserve.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            AdminStatsDTO stats = adminService.getDashboardStats();
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = adminService.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
  
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        try {
            List<BookingResponseDTO> bookings = adminService.getAllBookings();
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/providers/pending")
    public ResponseEntity<?> getPendingProviders() {
        try {
            List<User> pendingProviders = adminService.getPendingProviders();
            return new ResponseEntity<>(pendingProviders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/providers/{providerId}/approve")
    public ResponseEntity<?> approveProvider(@PathVariable Long providerId) {
        try {
            User approvedProvider = adminService.approveProvider(providerId);
            return new ResponseEntity<>(approvedProvider, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/providers/{providerId}/reject")
    public ResponseEntity<?> rejectProvider(@PathVariable Long providerId) {
        try {
            User rejectedProvider = adminService.rejectProvider(providerId);
            return new ResponseEntity<>(rejectedProvider, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}