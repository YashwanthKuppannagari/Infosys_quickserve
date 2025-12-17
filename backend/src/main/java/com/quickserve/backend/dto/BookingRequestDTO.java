package com.quickserve.backend.dto;

public class BookingRequestDTO {

    private Long customerId;
    private Long providerId;
    private String serviceName;
    private String serviceLocation;
    private String bookingDate; 
    private String bookingTime; 
    private String customerAddress;
    private Double bookingPrice;
    private Double latitude;
    private Double longitude;
    private String paymentId;
    private String paymentMethod;
    private Double walletAmountUsed;


    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getServiceLocation() { return serviceLocation; }
    public void setServiceLocation(String serviceLocation) { this.serviceLocation = serviceLocation; }
    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }
    public String getBookingTime() { return bookingTime; }
    public void setBookingTime(String bookingTime) { this.bookingTime = bookingTime; }
    public String getCustomerAddress() { return customerAddress; }
    public void setCustomerAddress(String customerAddress) { this.customerAddress = customerAddress; }
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
    public Double getWalletAmountUsed() { return walletAmountUsed; }
    public void setWalletAmountUsed(Double walletAmountUsed) { this.walletAmountUsed = walletAmountUsed; }
}