package com.quickserve.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating; 
    private String comment;

    @OneToOne
    @JoinColumn(name = "booking_id", referencedColumnName = "id", unique = true)
    private Booking booking;

    public Review() {
    }

    public Review(Integer rating, String comment, Booking booking) {
        this.rating = rating;
        this.comment = comment;
        this.booking = booking;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }
}