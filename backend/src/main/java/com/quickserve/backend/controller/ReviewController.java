package com.quickserve.backend.controller;

import com.quickserve.backend.dto.ReviewRequestDTO;
import com.quickserve.backend.model.Review;
import com.quickserve.backend.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/{bookingId}")
    public ResponseEntity<?> addReview(@PathVariable Long bookingId, @RequestBody ReviewRequestDTO reviewRequest) {
        try {
            Review review = reviewService.addReview(bookingId, reviewRequest);
            return new ResponseEntity<>("Review submitted successfully!", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/provider/{providerId}/summary")
    public ResponseEntity<?> getProviderRatingSummary(@PathVariable Long providerId) {
        try {
            Double average = reviewService.getProviderAverageRating(providerId);
            Integer count = reviewService.getProviderReviewCount(providerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", average);
            response.put("totalReviews", count);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}