package com.quickserve.backend.repository;

import com.quickserve.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomerIdOrderByIdDesc(Long customerId);
    List<Booking> findByProviderIdOrderByIdDesc(Long providerId);
    
    long countByBookingDateAfter(LocalDate date);

    List<Booking> findAllByOrderByIdDesc();

   
    long countByProviderIdAndBookingDateAndBookingTimeAndBookingStatusNot(
        Long providerId, 
        LocalDate bookingDate, 
        LocalTime bookingTime, 
        String status
    );
}