package com.eliascardona.chat_spring_boot.chat_domain.command;

public record NewChatMessageCommand (
    String sender,
    String recipient,
    String message
) {}
