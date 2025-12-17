package com.quickserve.backend.service;

import com.quickserve.backend.dto.AdminStatsDTO;
import com.quickserve.backend.dto.BookingResponseDTO; // Import DTO
import com.quickserve.backend.model.Booking; // Import Booking
import com.quickserve.backend.model.User;
import com.quickserve.backend.repository.BookingRepository;
import com.quickserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors; // Import Collectors

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingRepository bookingRepository;

    
    public AdminStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeProviders = userRepository.countByRoleAndAccountStatus("Provider", "APPROVED");
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        long recentBookings = bookingRepository.countByBookingDateAfter(sevenDaysAgo);
        return new AdminStatsDTO(totalUsers, activeProviders, recentBookings);
    }

    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    
    public List<BookingResponseDTO> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAllByOrderByIdDesc();
        
        return bookings.stream()
                .map(BookingResponseDTO::new)
                .collect(Collectors.toList());
    }

    
    public List<User> getPendingProviders() {
        return userRepository.findByRoleAndAccountStatus("Provider", "PENDING");
    }

    public User approveProvider(Long providerId) throws Exception {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new Exception("Provider not found with ID: " + providerId));
        provider.setAccountStatus("APPROVED");
        return userRepository.save(provider);
    }

    public User rejectProvider(Long providerId) throws Exception {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new Exception("Provider not found with ID: " + providerId));
        provider.setAccountStatus("REJECTED");
        return userRepository.save(provider);
    }
}