package com.eliascardona.chat_spring_boot.chat_domain.repository;

import com.eliascardona.chat_spring_boot.chat_domain.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface ChatRepository
        extends JpaRepository<ChatMessage, UUID>, JpaSpecificationExecutor<ChatMessage> {
}
