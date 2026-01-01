package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.OrderDTO;
import com.franchiseintel.dto.PaginatedResponse;
import com.franchiseintel.dto.SalesTrendDTO;
import com.franchiseintel.dto.StoreDashboardDTO;
import com.franchiseintel.dto.TopProductDTO;
import com.franchiseintel.entity.Order;
import com.franchiseintel.enums.OrderStatus;
import com.franchiseintel.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreDashboardDTO>> getStoreDashboard(
            @PathVariable Long storeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        StoreDashboardDTO dashboard = storeService.getStoreDashboard(storeId, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("success", "Store dashboard retrieved", dashboard));
    }

    @GetMapping("/{storeId}/sales-trend")
    public ResponseEntity<ApiResponse<List<SalesTrendDTO>>> getSalesTrend(@PathVariable Long storeId) {
        List<SalesTrendDTO> salesTrend = storeService.getSalesTrend(storeId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Sales trend retrieved", salesTrend));
    }
    
    @GetMapping("/recentOrders/{storeId}")
    public ResponseEntity<ApiResponse<PaginatedResponse<OrderDTO>>> getRecentOrders(
            @PathVariable Long storeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize) {
        Page<OrderDTO> orders = storeService.getRecentOrders(storeId, startDate, endDate, pageNumber, pageSize);
        PaginatedResponse<OrderDTO> response = new PaginatedResponse<>(
            orders.getContent(),
            orders.getNumber(),
            orders.getSize(),
            orders.getTotalElements(),
            orders.getTotalPages(),
            orders.isFirst(),
            orders.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>("success", "Recent orders retrieved", response));
    }
    
    @GetMapping("/{storeId}/top-products")
    public ResponseEntity<ApiResponse<List<TopProductDTO>>> getTopSellingProducts(
            @PathVariable Long storeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        List<TopProductDTO> topProducts = storeService.getTopSellingProducts(storeId, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>("success", "Top selling products retrieved", topProducts));
    }
}
