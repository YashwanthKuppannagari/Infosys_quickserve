package com.quickserve.backend.controller;

import com.quickserve.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Double> data) {
        try {
            Double amount = data.get("amount");
            String orderId = paymentService.createOrder(amount);
            return new ResponseEntity<>(orderId, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}