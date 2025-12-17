// File: src/main/java/com/quickserve/backend/repository/ReviewRepository.java

package com.quickserve.backend.repository;

import com.quickserve.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByBookingProviderId(Long providerId);
}