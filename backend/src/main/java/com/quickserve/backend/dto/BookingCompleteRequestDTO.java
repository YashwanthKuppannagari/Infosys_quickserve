// File: src/main/java/com/quickserve/backend/dto/BookingCompleteRequestDTO.java

package com.quickserve.backend.dto;

// This DTO is used to receive the OTP from the provider
public class BookingCompleteRequestDTO {

    private String otp;

    // --- Getters and Setters ---
    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}