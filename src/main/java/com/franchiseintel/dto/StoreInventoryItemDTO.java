package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreInventoryItemDTO {
    private Long itemId;
    private String itemName;
    private String imageUrl;
    private Integer stock;
    private Integer reorderValue;
    private BigDecimal costPerQuantity;
    private BigDecimal totalValue;
    private String stockStatus;
}
