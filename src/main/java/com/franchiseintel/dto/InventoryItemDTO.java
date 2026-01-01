package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private Long id;
    private Long franchiseId;
    private String franchiseName;
    private Long productId;
    private String productName;
    private String productCategory;
    private BigDecimal productPrice;
    private Integer quantity;
    private LocalDateTime lastUpdated;
}
