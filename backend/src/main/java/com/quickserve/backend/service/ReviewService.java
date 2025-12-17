package com.quickserve.backend.service;

import com.quickserve.backend.dto.ReviewRequestDTO;
import com.quickserve.backend.model.Booking;
import com.quickserve.backend.model.Review;
import com.quickserve.backend.repository.BookingRepository;
import com.quickserve.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookingRepository bookingRepository;

   
    public Review addReview(Long bookingId, ReviewRequestDTO reviewRequest) throws Exception {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new Exception("Booking not found"));

        
        if (!"COMPLETED".equalsIgnoreCase(booking.getBookingStatus())) {
            throw new Exception("You can only review completed bookings.");
        }

        
        
        Review review = new Review();
        review.setRating(reviewRequest.getRating());
        review.setComment(reviewRequest.getComment());
        review.setBooking(booking);

        return reviewRepository.save(review);
    }

    
    public Double getProviderAverageRating(Long providerId) {
        List<Review> reviews = reviewRepository.findByBookingProviderId(providerId);

        if (reviews.isEmpty()) {
            return 0.0; // No reviews yet
        }

       
        double sum = 0;
        for (Review review : reviews) {
            sum += review.getRating();
        }

        
        return sum / reviews.size();
    }
    
    
    public Integer getProviderReviewCount(Long providerId) {
         return reviewRepository.findByBookingProviderId(providerId).size();
    }
}