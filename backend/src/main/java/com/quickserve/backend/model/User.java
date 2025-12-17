package com.quickserve.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;

@Entity
@Table(name="user_account") 
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password; 
    private String role; 
    private String fullName;
    private String phoneNumber;
    private Double walletBalance = 0.0;
    
    @Column(name = "reset_token")
    private String resetToken;
    
    @Column(unique = true)
    private String email;
    
    private String accountStatus;

    
    @Column(length = 512) 
    private String servicesProvided; 
    private String operatingLocation; 
    private Integer age;
    private String highestQualification;
    private String collegeName;
    private Double percentage;
    private Integer yearsOfExperience;
    @Column(length = 512) 
    private String providerAddress;
    private String startTime; 
    private String endTime;   
    
    
    @Lob
    @Column(length = 1000000) 
    private byte[] profilePicture;
    private String profilePictureType;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }								
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public String getServicesProvided() { return servicesProvided; }
    public void setServicesProvided(String servicesProvided) { this.servicesProvided = servicesProvided; }
    public String getOperatingLocation() { return operatingLocation; }
    public void setOperatingLocation(String operatingLocation) { this.operatingLocation = operatingLocation; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getHighestQualification() { return highestQualification; }
    public void setHighestQualification(String highestQualification) { this.highestQualification = highestQualification; }
    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getProviderAddress() { return providerAddress; }
    public void setProviderAddress(String providerAddress) { this.providerAddress = providerAddress; }
    public byte[] getProfilePicture() { return profilePicture; }
    public void setProfilePicture(byte[] profilePicture) { this.profilePicture = profilePicture; }
    public String getProfilePictureType() { return profilePictureType; }
    public void setProfilePictureType(String profilePictureType) { this.profilePictureType = profilePictureType; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public Double getWalletBalance() { return walletBalance; }
    public void setWalletBalance(Double walletBalance) { this.walletBalance = walletBalance; }
    
}