package com.eliascardona.chat_spring_boot.core.springbootconfig;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
@ConfigurationProperties(prefix = "core.springbootconfig")
public class AppConfigurationProperties {

    private final Jwt jwt = new Jwt();
    private final Otp otp = new Otp();
    private final RateLimit rateLimit = new RateLimit();
    private final Email email = new Email();

    @Setter
    @Getter
    public static class Jwt {
        @Value(value = "${jwt_secret}")
        private String secret;
        private long accessTokenExpiration = 450000; // 7.5 minutes
        private long refreshTokenExpiration = 604800000; // 7 days
        private String issuer = "eliascardona-spring-boot-test-app";
        private String audience = "eliascardona-spring-boot-test-app-api-users";

    }

    @Setter
    @Getter
    public static class Otp {
        private long expiration = 300000; // 5 minutes
        private int maxAttempts = 3;
        private int length = 6;

    }

    @Setter
    @Getter
    public static class RateLimit {
        private int loginAttempts = 5;
        private long loginWindow = 900000; // 15 minutes
        private int usernameValidation = 10;
        private int otpRequests = 3;
        private long otpRequestsWindow = 3600000; // 1 hour
        private int otpVerification = 5;
        private long otpVerificationWindow = 900000; // 15 minutes
        private int registration = 3;
        private long registrationWindow = 3600000; // 1 hour

    }

    @Setter
    @Getter
    public static class Email {
        private String fromAddress = "noreply@opselling.com";
        private String fromName = "OpSelling Support";

    }
}
