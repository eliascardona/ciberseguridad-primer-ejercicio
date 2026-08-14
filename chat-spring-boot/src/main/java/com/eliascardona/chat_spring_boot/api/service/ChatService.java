package com.eliascardona.chat_spring_boot.api.service;

import com.eliascardona.chat_spring_boot.api.command.NewChatMessageCommand;
import com.eliascardona.chat_spring_boot.api.dto.ChatDto;
import com.eliascardona.chat_spring_boot.api.entity.ChatMessage;
import com.eliascardona.chat_spring_boot.api.repository.ChatRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ChatService {
    private final ChatRepository chatRepository;

    public ChatService(
        ChatRepository chatRepository
    ) {
        this.chatRepository = chatRepository;
    }

    public ChatDto.SavedMessageResponse saveChatMessage(
        NewChatMessageCommand command
    ) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setMessageContent(command.message());
        ChatMessage newChatMessage = chatRepository.save(chatMessage);

        return ChatDto.SavedMessageResponse.builder()
                .messageContent(newChatMessage.getMessageContent())
                .build();
    }

    public ChatDto.VerifiedMessageResponse findChatMessageById(
            UUID chatMessageId
    ) {
        ChatMessage verifiedChatMessage = chatRepository
                .findById(chatMessageId)
                .orElseThrow(
                        () -> new EntityNotFoundException(
                                "Message: " + chatMessageId + " was not found"));

        return ChatDto.VerifiedMessageResponse.builder()
                .chatMessageId(verifiedChatMessage.getId())
                .messageContent(verifiedChatMessage.getMessageContent())
                .build();
    }
}