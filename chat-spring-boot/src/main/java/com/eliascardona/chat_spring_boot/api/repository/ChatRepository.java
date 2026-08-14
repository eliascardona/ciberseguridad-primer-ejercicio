package com.eliascardona.chat_spring_boot.api.repository;

import com.eliascardona.chat_spring_boot.api.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ChatRepository
        extends JpaRepository<ChatMessage, UUID>, JpaSpecificationExecutor<ChatMessage> {
}
