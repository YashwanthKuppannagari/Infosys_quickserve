package com.quickserve.backend.controller;

import com.quickserve.backend.model.ChatMessage;
import com.quickserve.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/{bookingId}/sendMessage")
    @SendTo("/topic/booking/{bookingId}")
    public ChatMessage sendMessage(@DestinationVariable Long bookingId, @Payload ChatMessage chatMessage) {
        chatMessage.setBookingId(bookingId);
        chatMessage.setTimestamp(LocalDateTime.now());
        return chatMessageRepository.save(chatMessage);
    }

    @GetMapping("/api/chat/{bookingId}/history")
    @ResponseBody
    public List<ChatMessage> getChatHistory(@PathVariable Long bookingId) {
        return chatMessageRepository.findByBookingIdOrderByTimestampAsc(bookingId);
    }
}