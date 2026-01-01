package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.BrandInfoDTO;
import com.franchiseintel.dto.PaginatedResponse;
import com.franchiseintel.entity.*;
import com.franchiseintel.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<PaginatedResponse<BrandInfoDTO>>> getAllBrandsWithFranchiseCount(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize) {
        PaginatedResponse<BrandInfoDTO> brands = adminService.getAllBrandsWithFranchiseCount(pageNumber, pageSize);
        return ResponseEntity.ok(new ApiResponse<>("success", "Brands with franchise count retrieved", brands));
    }
}
