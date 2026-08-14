package com.eliascardona.chat_spring_boot.api.service;

import com.eliascardona.chat_spring_boot.api.command.NewChatMessageCommand;
import com.eliascardona.chat_spring_boot.api.dto.ChatDto;
import com.eliascardona.chat_spring_boot.api.entity.ChatMessage;
import com.eliascardona.chat_spring_boot.api.repository.ChatRepository;
import org.springframework.stereotype.Service;

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
        chatMessage.setSender(command.sender());
        chatMessage.setRecipient(command.recipient());
        chatMessage.setMessage(command.message());
        ChatMessage newChatMessage = chatRepository.save(chatMessage);

        return ChatDto.SavedMessageResponse.builder()
                .message(newChatMessage.getMessage())
                .build();
    }
}