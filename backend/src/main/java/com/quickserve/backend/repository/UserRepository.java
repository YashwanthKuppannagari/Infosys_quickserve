package com.quickserve.backend.repository;

import com.quickserve.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; 

public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByUsername(String username); 
    User findByEmail(String email); 
    
    
    User findByResetToken(String resetToken);
    
    List<User> findByRoleAndOperatingLocationAndServicesProvidedContainingIgnoreCase(
        String role, String operatingLocation, String service
    );
    
    List<User> findByRoleAndAccountStatus(String role, String accountStatus);
    
    
    long countByRoleAndAccountStatus(String role, String accountStatus);
}