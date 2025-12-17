package com.quickserve.backend.service;

import com.quickserve.backend.model.User;
import com.quickserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public User registerUser(User user) throws Exception {
        if(userRepository.findByEmail(user.getEmail()) != null) {
            throw new Exception("User already exists");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        
        return userRepository.save(user);
    }
    public User loginUser(String email, String password) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new Exception("User not found");

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid credentials");
        }
        return user;
    }
    public void addFunds(User user, Double amount) {
        Double current = user.getWalletBalance() == null ? 0.0 : user.getWalletBalance();
        user.setWalletBalance(current + amount);
        userRepository.save(user);
    }

    public void deductFunds(User user, Double amount) throws Exception {
        Double current = user.getWalletBalance() == null ? 0.0 : user.getWalletBalance();
        if (current < amount) {
            throw new Exception("Insufficient wallet balance.");
        }
        user.setWalletBalance(current - amount);
        userRepository.save(user);
    }
    
    public Double withdrawFunds(Long userId) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        Double balance = user.getWalletBalance() == null ? 0.0 : user.getWalletBalance();
        
        if (balance <= 0) {
            throw new Exception("No funds to withdraw.");
        }
        
        user.setWalletBalance(0.0);
        userRepository.save(user);
        
        return balance;
    }
    
    public User updateUser(Long userId, User userDetails) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        user.setFullName(userDetails.getFullName());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setEmail(userDetails.getEmail());
        user.setStartTime(userDetails.getStartTime());
        user.setEndTime(userDetails.getEndTime());
        return userRepository.save(user);
    }
   
    public void uploadProfilePicture(Long userId, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        if (file.isEmpty()) throw new Exception("Cannot upload empty file");
        user.setProfilePicture(file.getBytes());
        user.setProfilePictureType(file.getContentType());
        userRepository.save(user);
    }
    public User getUserById(Long userId) throws Exception {
         return userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
    }
    public void generateAndSendOtp(String email) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new Exception("User not found");

        String otp = String.valueOf(new Random().nextInt(9000) + 1000);
        user.setResetToken(otp);
        userRepository.save(user);

        emailService.sendSimpleEmail(email, "Password Reset OTP", "Your OTP is: " + otp);
    }

    public void resetPassword(String email, String token, String newPassword) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new Exception("User not found");

        if (user.getResetToken() == null || !user.getResetToken().equals(token)) {
            throw new Exception("Invalid OTP");
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        
        user.setResetToken(null);
        userRepository.save(user);
    }
}