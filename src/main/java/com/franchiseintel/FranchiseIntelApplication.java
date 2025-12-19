package com.franchiseintel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class})
public class FranchiseIntelApplication {

    public static void main(String[] args) {
        SpringApplication.run(FranchiseIntelApplication.class, args);
    }
}

