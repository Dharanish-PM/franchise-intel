package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.InventoryStatsDTO;
import com.franchiseintel.dto.PageResponse;
import com.franchiseintel.dto.StoreInventoryItemDTO;
import com.franchiseintel.enums.StockStatus;
import com.franchiseintel.exception.CustomException;
import com.franchiseintel.repository.FranchiseRepository;
import com.franchiseintel.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryManagementController {

    private final InventoryRepository inventoryRepository;
    private final FranchiseRepository franchiseRepository;

    @GetMapping("/{storeId}/stats")
    public ResponseEntity<ApiResponse<InventoryStatsDTO>> getInventoryStats(@PathVariable Long storeId) {
        if (!franchiseRepository.existsById(storeId)) {
            throw new CustomException("Store not found with ID: " + storeId);
        }
        
        Long totalItems = inventoryRepository.countByFranchiseId(storeId);
        BigDecimal totalValue = inventoryRepository.getTotalValueByFranchiseId(storeId);
        Long lowStockCount = inventoryRepository.countLowStockByFranchiseId(storeId);
        Long outOfStockCount = inventoryRepository.countOutOfStockByFranchiseId(storeId);
        
        InventoryStatsDTO stats = new InventoryStatsDTO(totalItems, totalValue, lowStockCount, outOfStockCount);
        return ResponseEntity.ok(new ApiResponse<>("success", "Inventory stats retrieved", stats));
    }
    
    @GetMapping("/{storeId}/items")
    public ResponseEntity<ApiResponse<PageResponse<StoreInventoryItemDTO>>> getStoreInventoryItems(
            @PathVariable Long storeId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") StockStatus stockStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (!franchiseRepository.existsById(storeId)) {
            throw new CustomException("Store not found with ID: " + storeId);
        }
        
        Pageable pageable = PageRequest.of(page, size);
        Page<StoreInventoryItemDTO> itemsPage = inventoryRepository.findByFranchiseIdWithSearch(storeId, search, pageable)
            .map(inv -> {
                BigDecimal costPerQuantity = inv.getProduct().getPrice();
                BigDecimal totalValue = costPerQuantity.multiply(new BigDecimal(inv.getQuantityAvailable()));
                String status = getStockStatus(inv.getQuantityAvailable(), inv.getMinStock());
                return new StoreInventoryItemDTO(
                    inv.getProduct().getId(),
                    inv.getProduct().getName(),
                    inv.getProduct().getImageUrl(),
                    inv.getQuantityAvailable(),
                    inv.getMinStock(),
                    costPerQuantity,
                    totalValue,
                    status
                );
            });
        
        List<StoreInventoryItemDTO> filteredContent = itemsPage.getContent().stream()
            .filter(item -> filterByStockStatus(item, stockStatus))
            .collect(Collectors.toList());
        
        PageResponse<StoreInventoryItemDTO> response = new PageResponse<>(
            filteredContent,
            itemsPage.getNumber(),
            itemsPage.getSize(),
            itemsPage.getTotalElements(),
            itemsPage.getTotalPages()
        );
        
        return ResponseEntity.ok(new ApiResponse<>("success", "Store inventory items retrieved", response));
    }
    
    private String getStockStatus(Integer quantity, Integer minStock) {
        if (quantity == 0) {
            return "OUT_OF_STOCK";
        }
        if (minStock != null && quantity <= minStock) {
            return "LOW_STOCK";
        }
        return "ENOUGH_STOCK";
    }
    
    private boolean filterByStockStatus(StoreInventoryItemDTO item, StockStatus status) {
        if (status == StockStatus.ALL) {
            return true;
        }
        String itemStatus = item.getStockStatus();
        return (status == StockStatus.ENOUGH && itemStatus.equals("ENOUGH_STOCK")) ||
               (status == StockStatus.LOW && itemStatus.equals("LOW_STOCK")) ||
               (status == StockStatus.OUT && itemStatus.equals("OUT_OF_STOCK"));
    }
}
