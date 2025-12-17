package com.quickserve.backend.controller;

import com.quickserve.backend.dto.BookingRequestDTO;
import com.quickserve.backend.dto.BookingCompleteRequestDTO; 
import com.quickserve.backend.dto.BookingResponseDTO; 
import com.quickserve.backend.model.Booking;
import com.quickserve.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; 

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO bookingRequest) {
        try {
            Booking newBooking = bookingService.createBooking(bookingRequest);
            return new ResponseEntity<>(new BookingResponseDTO(newBooking), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getBookingsByCustomer(@PathVariable Long customerId) {
        try {
            List<BookingResponseDTO> bookings = bookingService.getBookingsForCustomer(customerId);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getBookingsByProvider(@PathVariable Long providerId) {
        try {
            List<BookingResponseDTO> bookings = bookingService.getBookingsForProvider(providerId);
            return new ResponseEntity<>(bookings, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{bookingId}/accept")
    public ResponseEntity<?> acceptBooking(@PathVariable Long bookingId) {
        try {
            BookingResponseDTO acceptedBooking = bookingService.acceptBooking(bookingId);
            return new ResponseEntity<>(acceptedBooking, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{bookingId}/decline")
    public ResponseEntity<?> declineBooking(@PathVariable Long bookingId) {
        try {
            BookingResponseDTO declinedBooking = bookingService.declineBooking(bookingId);
            return new ResponseEntity<>(declinedBooking, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<?> completeBooking(
            @PathVariable Long bookingId, 
            @RequestBody BookingCompleteRequestDTO completeRequest) {
        try {
            BookingResponseDTO completedBooking = bookingService.completeBooking(bookingId, completeRequest);
            return new ResponseEntity<>(completedBooking, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            BookingResponseDTO cancelledBooking = bookingService.cancelBookingByUser(bookingId);
            return new ResponseEntity<>(cancelledBooking, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}