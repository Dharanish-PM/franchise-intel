package com.franchiseintel.impl;

import com.franchiseintel.dto.CreateInventoryRequestDTO;
import com.franchiseintel.dto.InventoryRequestItemDTO;
import com.franchiseintel.dto.ProductSearchDTO;
import com.franchiseintel.entity.Franchise;
import com.franchiseintel.entity.InventoryRequest;
import com.franchiseintel.entity.InventoryRequestItem;
import com.franchiseintel.entity.Product;
import com.franchiseintel.enums.RequestItemStatus;
import com.franchiseintel.enums.RequestStatus;
import com.franchiseintel.repository.FranchiseRepository;
import com.franchiseintel.repository.InventoryRequestRepository;
import com.franchiseintel.repository.ProductRepository;
import com.franchiseintel.service.InventoryRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryRequestServiceImpl implements InventoryRequestService {

    private final InventoryRequestRepository inventoryRequestRepository;
    private final FranchiseRepository franchiseRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void createInventoryRequest(CreateInventoryRequestDTO requestDTO) {
        // Get franchise
        Franchise franchise = franchiseRepository.findById(requestDTO.getStoreId())
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + requestDTO.getStoreId()));

        // Generate request number
        String requestNumber = generateRequestNumber(requestDTO.getStoreId());

        // Create inventory request
        InventoryRequest inventoryRequest = new InventoryRequest();
        inventoryRequest.setRequestNumber(requestNumber);
        inventoryRequest.setFranchise(franchise);
        inventoryRequest.setStatus(RequestStatus.Pending);
        inventoryRequest.setNotes(requestDTO.getNotes());

        // Create request items
        List<InventoryRequestItem> items = new ArrayList<>();
        for (InventoryRequestItemDTO itemDTO : requestDTO.getItems()) {
            Product product = productRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemDTO.getItemId()));
            
            InventoryRequestItem item = new InventoryRequestItem();
            item.setInventoryRequest(inventoryRequest);
            item.setProduct(product);
            item.setQuantityRequested(itemDTO.getQuantityRequested());
            item.setQuantityApproved(0);
            item.setQuantityShipped(0);
            item.setPriority(itemDTO.getPriority());
            item.setStatus(RequestItemStatus.Pending);
            items.add(item);
        }
        
        inventoryRequest.setItems(items);

        // Save to database
        inventoryRequestRepository.save(inventoryRequest);
    }

    @Override
    public List<ProductSearchDTO> searchProducts(Long storeId, String searchTerm) {
        // Get franchise to get brand ID
        Franchise franchise = franchiseRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found with id: " + storeId));
        
        Long brandId = franchise.getBrand().getId();
        
        List<Product> products;
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            // Return 5 random products for the brand
            products = productRepository.findRandomProductsByBrandId(brandId, PageRequest.of(0, 5));
        } else {
            // Search by product name for the brand (case-insensitive)
            products = productRepository.findByBrandIdAndNameContainingIgnoreCase(brandId, searchTerm);
        }
        
        return products.stream()
                .map(product -> new ProductSearchDTO(product.getId(), product.getName()))
                .collect(Collectors.toList());
    }

    private String generateRequestNumber(Long storeId) {
        String prefix = "REQ-STR" + storeId + "-%";
        Integer maxNumber = inventoryRequestRepository.findMaxRequestNumberByPrefix(prefix);
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("REQ-STR%d-%03d", storeId, nextNumber);
    }
}
