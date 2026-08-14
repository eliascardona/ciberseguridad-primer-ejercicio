package com.eliascardona.chat_spring_boot.api.command;

public record NewChatMessageCommand (
    String sender,
    String recipient,
    String message
) {}
