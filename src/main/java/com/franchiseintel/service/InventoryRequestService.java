package com.franchiseintel.service;

import com.franchiseintel.dto.CreateInventoryRequestDTO;
import com.franchiseintel.dto.ProductSearchDTO;

import java.util.List;

public interface InventoryRequestService {
    void createInventoryRequest(CreateInventoryRequestDTO requestDTO);
    List<ProductSearchDTO> searchProducts(Long storeId, String searchTerm);
}
