package com.eliascardona.chat_spring_boot.core.springbootconfig;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.eliascardona.chat_spring_boot")
@EntityScan(basePackages = "com.eliascardona.chat_spring_boot")
@EnableJpaAuditing
public class JpaConfig {}
