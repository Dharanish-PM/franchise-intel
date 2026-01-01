package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatsDTO {
    private Long totalItems;
    private BigDecimal totalValue;
    private Long lowStockCount;
    private Long outOfStockCount;
}
