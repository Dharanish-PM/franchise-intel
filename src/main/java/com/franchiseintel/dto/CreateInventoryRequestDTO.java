package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInventoryRequestDTO {
    private Long storeId;
    private String notes;
    private List<InventoryRequestItemDTO> items;
}
