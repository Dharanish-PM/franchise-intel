package com.franchiseintel.service;

import com.franchiseintel.dto.BrandInfoDTO;
import com.franchiseintel.dto.PaginatedResponse;

public interface AdminService {
    PaginatedResponse<BrandInfoDTO> getAllBrandsWithFranchiseCount(int pageNumber, int pageSize);
}
