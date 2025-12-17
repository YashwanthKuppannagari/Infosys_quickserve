package com.quickserve.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public String createOrder(Double amount) throws Exception {
        RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        
        orderRequest.put("amount", amount * 100); 
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

        Order order = razorpay.orders.create(orderRequest);
        return order.get("id");
    }
}