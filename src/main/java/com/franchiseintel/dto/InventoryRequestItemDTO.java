package com.franchiseintel.dto;

import com.franchiseintel.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequestItemDTO {
    private Long itemId;
    private Integer quantityRequested;
    private Priority priority;
}
