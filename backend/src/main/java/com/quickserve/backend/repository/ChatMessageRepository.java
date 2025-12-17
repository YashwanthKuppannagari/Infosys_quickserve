package com.quickserve.backend.repository;

import com.quickserve.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByBookingIdOrderByTimestampAsc(Long bookingId);
}