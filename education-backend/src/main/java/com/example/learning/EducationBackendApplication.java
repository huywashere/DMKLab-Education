package com.example.learning;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EducationBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EducationBackendApplication.class, args);
    }
}
