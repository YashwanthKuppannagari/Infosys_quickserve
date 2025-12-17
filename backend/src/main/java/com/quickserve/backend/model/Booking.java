package com.quickserve.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false) 
    private User customer;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false) 
    private User provider;
    
    @Column(nullable = false)
    private String serviceName;
    
    @Column(nullable = false)
    private String serviceLocation; 

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime bookingTime;

    @Column(nullable = false)
    private String bookingStatus; 

    @Column(length = 512) 
    private String customerAddress;
    
    private String otp;
    
    private Double bookingPrice;
    
    private Double latitude;
    private Double longitude;
    private String paymentId;
    private String paymentMethod;

    public Booking() {
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public User getProvider() { return provider; }
    public void setProvider(User provider) { this.provider = provider; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getServiceLocation() { return serviceLocation; }
    public void setServiceLocation(String serviceLocation) { this.serviceLocation = serviceLocation; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalTime bookingTime) { this.bookingTime = bookingTime; }
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public Double getBookingPrice() { return bookingPrice; }
    public void setBookingPrice(Double bookingPrice) { this.bookingPrice = bookingPrice; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}