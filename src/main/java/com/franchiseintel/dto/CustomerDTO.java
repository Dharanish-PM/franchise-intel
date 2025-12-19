package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {
    private Long id;
    private String customerName;
    private String email;
    private String phoneNumber;
    private String dateOfBirth;
    private String gender;
    private Integer totalOrders;
    private Double totalSpend;
    private LocalDateTime lastActivityDate;
    private LocalDateTime registrationDate;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

