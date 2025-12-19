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
public class OrderDTO {
    private Long id;
    private String orderNumber;
    private LocalDateTime orderDate;
    private String customerName;
    private String storeName;
    private Double totalAmount;
    private String orderStatus;
    private String paymentMethod;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

