package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemDTO {
    private Long id;
    private String itemName;
    private String sku;
    private Integer currentStock;
    private Integer reorderLevel;
    private Double unitCost;
    private String itemImage;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

