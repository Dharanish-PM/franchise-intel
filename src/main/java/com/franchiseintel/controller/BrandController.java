package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.BrandDashboardDTO;
import com.franchiseintel.dto.SalesTrendDTO;
import com.franchiseintel.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brand")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping("/{brandId}")
    public ResponseEntity<ApiResponse<BrandDashboardDTO>> getBrandDashboard(@PathVariable Long brandId) {
        BrandDashboardDTO dashboard = brandService.getBrandDashboard(brandId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Brand dashboard retrieved", dashboard));
    }

    @GetMapping("/{brandId}/sales-trend")
    public ResponseEntity<ApiResponse<List<SalesTrendDTO>>> getSalesTrend(@PathVariable Long brandId) {
        List<SalesTrendDTO> salesTrend = brandService.getSalesTrend(brandId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Sales trend retrieved", salesTrend));
    }
}
