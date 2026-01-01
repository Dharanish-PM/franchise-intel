package com.franchiseintel.service;

import com.franchiseintel.dto.BrandDashboardDTO;
import com.franchiseintel.dto.SalesTrendDTO;
import java.util.List;

public interface BrandService {
    BrandDashboardDTO getBrandDashboard(Long brandId);
    List<SalesTrendDTO> getSalesTrend(Long brandId);
}
