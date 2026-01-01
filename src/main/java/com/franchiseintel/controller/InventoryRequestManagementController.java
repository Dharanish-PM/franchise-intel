package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.CreateInventoryRequestDTO;
import com.franchiseintel.dto.ProductSearchDTO;
import com.franchiseintel.service.InventoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory-requests")
@RequiredArgsConstructor
public class InventoryRequestManagementController {

    private final InventoryRequestService inventoryRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createInventoryRequest(
            @RequestBody CreateInventoryRequestDTO requestDTO) {
        
        inventoryRequestService.createInventoryRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Inventory request created successfully", null));
    }

    @GetMapping("/{storeId}/search-products")
    public ResponseEntity<ApiResponse<List<ProductSearchDTO>>> searchProducts(
            @PathVariable Long storeId,
            @RequestParam(required = false) String search) {
        
        List<ProductSearchDTO> products = inventoryRequestService.searchProducts(storeId, search);
        return ResponseEntity.ok(new ApiResponse<>("success", "Products retrieved successfully", products));
    }
}
