package com.quickserve.backend.service;

import com.quickserve.backend.dto.BookingRequestDTO;
import com.quickserve.backend.dto.BookingCompleteRequestDTO; 
import com.quickserve.backend.dto.BookingResponseDTO; 
import com.quickserve.backend.model.Booking;
import com.quickserve.backend.model.User;
import com.quickserve.backend.repository.BookingRepository;
import com.quickserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Random; 
import java.util.stream.Collectors; 

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private UserService userService; // Inject UserService
    
    private final Random random = new Random();

    private String generateOtp() {
        int otpValue = 1000 + this.random.nextInt(9000);
        return String.valueOf(otpValue);
    }

    
    public Booking createBooking(BookingRequestDTO bookingRequest) throws Exception {
        System.out.println("--- NEW BOOKING REQUEST RECEIVED ---");
        System.out.println("Payment Method: " + bookingRequest.getPaymentMethod());
        System.out.println("Wallet Amount Requested: " + bookingRequest.getWalletAmountUsed());

        User customer = userRepository.findById(bookingRequest.getCustomerId())
                .orElseThrow(() -> new Exception("Customer not found"));
        User provider = userRepository.findById(bookingRequest.getProviderId())
                .orElseThrow(() -> new Exception("Provider not found"));
        
        LocalDate date = LocalDate.parse(bookingRequest.getBookingDate());
        LocalTime time = LocalTime.parse(bookingRequest.getBookingTime());

        
        if (provider.getStartTime() != null && provider.getEndTime() != null) {
            LocalTime start = LocalTime.parse(provider.getStartTime());
            LocalTime end = LocalTime.parse(provider.getEndTime());
            if (time.isBefore(start) || time.isAfter(end)) throw new Exception("Provider unavailable.");
        }
        
        
        Double walletUsed = bookingRequest.getWalletAmountUsed();
        
        if (walletUsed != null && walletUsed > 0) {
            System.out.println(">>> Attempting to deduct: " + walletUsed);
            System.out.println(">>> Current Balance: " + customer.getWalletBalance());
            
            userService.deductFunds(customer, walletUsed);
            
            System.out.println(">>> DEDUCTION SUCCESSFUL. New Balance: " + customer.getWalletBalance());
        } else {
            System.out.println(">>> NO WALLET DEDUCTION TRIGGERED (Amount was null or 0)");
        }

       
        Booking newBooking = new Booking();
        newBooking.setCustomer(customer);
        newBooking.setProvider(provider);
        newBooking.setServiceName(bookingRequest.getServiceName());
        newBooking.setServiceLocation(bookingRequest.getServiceLocation());
        newBooking.setBookingDate(date);
        newBooking.setBookingTime(time);
        newBooking.setBookingStatus("PENDING");
        newBooking.setCustomerAddress(bookingRequest.getCustomerAddress());
        newBooking.setBookingPrice(bookingRequest.getBookingPrice());
        newBooking.setLatitude(bookingRequest.getLatitude());
        newBooking.setLongitude(bookingRequest.getLongitude());
        newBooking.setPaymentId(bookingRequest.getPaymentId());
        newBooking.setPaymentMethod(bookingRequest.getPaymentMethod());
         

        return bookingRepository.save(newBooking);
    }
    
  
    public BookingResponseDTO declineBooking(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found"));
        
        if (!"PENDING".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new Exception("Booking is no longer pending.");
        }
        
        booking.setBookingStatus("DECLINED");
        
        
        User customer = booking.getCustomer();
        userService.addFunds(customer, booking.getBookingPrice());
        
        
        Booking savedBooking = bookingRepository.save(booking);
        return new BookingResponseDTO(savedBooking);
    }
    
    
    public BookingResponseDTO completeBooking(Long bookingId, BookingCompleteRequestDTO completeRequest) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found"));
        
        if (!"ACTIVE".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new Exception("Booking is not active.");
        }
        if (completeRequest.getOtp() == null || !completeRequest.getOtp().equals(booking.getOtp())) {
            throw new Exception("Invalid OTP.");
        }
        
        booking.setBookingStatus("COMPLETED");
        booking.setOtp(null); 
        
        
        User provider = booking.getProvider();
        userService.addFunds(provider, booking.getBookingPrice());
        
        
        Booking savedBooking = bookingRepository.save(booking);

        new Thread(() -> {
            String subject = "Service Completed";
            String body = "Service marked as completed.\nAmount Paid: " + booking.getBookingPrice();
            emailService.sendSimpleEmail(booking.getCustomer().getEmail(), subject, body);
        }).start();

        return new BookingResponseDTO(savedBooking);
    }
    
    
    
    
    public List<BookingResponseDTO> getBookingsForCustomer(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByIdDesc(customerId).stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }
    public List<BookingResponseDTO> getBookingsForProvider(Long providerId) {
        return bookingRepository.findByProviderIdOrderByIdDesc(providerId).stream().map(BookingResponseDTO::new).collect(Collectors.toList());
    }
    public BookingResponseDTO acceptBooking(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new Exception("Not found"));
        if (!"PENDING".equalsIgnoreCase(booking.getBookingStatus())) throw new Exception("Not pending");
        booking.setBookingStatus("ACTIVE");
        booking.setOtp(generateOtp());
        Booking savedBooking = bookingRepository.save(booking);
        new Thread(() -> emailService.sendSimpleEmail(booking.getCustomer().getEmail(), "Accepted", "Your OTP is " + booking.getOtp())).start();
        return new BookingResponseDTO(savedBooking);
    }
    public BookingResponseDTO cancelBookingByUser(Long bookingId) throws Exception {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new Exception("Not found"));
        if (!"PENDING".equalsIgnoreCase(booking.getBookingStatus())) throw new Exception("Not pending");
        booking.setBookingStatus("CANCELLED");
        
        userService.addFunds(booking.getCustomer(), booking.getBookingPrice());
      
        Booking savedBooking = bookingRepository.save(booking);
        return new BookingResponseDTO(savedBooking);
    }
}