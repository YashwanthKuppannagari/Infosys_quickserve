package com.quickserve.backend.dto;

import com.quickserve.backend.model.Booking;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingResponseDTO {

    private Long id;
    private Long customerId;
    private Long providerId;
    private String serviceName;
    private String serviceLocation;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private String bookingStatus;
    private String customerName;
    private String providerName;
    private String customerAddress;
    private String providerPhoneNumber;
    private String otp;
    private Double bookingPrice;
    private Double latitude;
    private Double longitude;

    public BookingResponseDTO(Booking booking) {
        this.id = booking.getId();
        this.serviceName = booking.getServiceName();
        this.serviceLocation = booking.getServiceLocation();
        this.bookingDate = booking.getBookingDate();
        this.bookingTime = booking.getBookingTime();
        this.bookingStatus = booking.getBookingStatus();
        this.customerAddress = booking.getCustomerAddress();
        this.otp = booking.getOtp();
        this.bookingPrice = booking.getBookingPrice();
        this.latitude = booking.getLatitude();
        this.longitude = booking.getLongitude();
        
        if (booking.getCustomer() != null) {
            this.customerName = booking.getCustomer().getFullName();
            this.customerId = booking.getCustomer().getId();
        } else {
            this.customerName = "Unknown";
            this.customerId = null;
        }
        
        if (booking.getProvider() != null) {
            this.providerName = booking.getProvider().getFullName();
            this.providerPhoneNumber = booking.getProvider().getPhoneNumber();
            this.providerId = booking.getProvider().getId();
        } else {
            this.providerName = "Unknown";
            this.providerPhoneNumber = "N/A";
            this.providerId = null;
        }
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
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
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
    public String getProviderPhoneNumber() { return providerPhoneNumber; }
    public void setProviderPhoneNumber(String providerPhoneNumber) { this.providerPhoneNumber = providerPhoneNumber; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public Double getBookingPrice() { return bookingPrice; }
    public void setBookingPrice(Double bookingPrice) { this.bookingPrice = bookingPrice; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}