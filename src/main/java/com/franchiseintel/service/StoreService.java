package com.franchiseintel.service;

import com.franchiseintel.dto.OrderDTO;
import com.franchiseintel.dto.SalesTrendDTO;
import com.franchiseintel.dto.StoreDashboardDTO;
import com.franchiseintel.dto.TopProductDTO;
import com.franchiseintel.entity.Order;
import org.springframework.data.domain.Page;
import java.util.List;

public interface StoreService {
    StoreDashboardDTO getStoreDashboard(Long storeId, String startDate, String endDate);
    List<SalesTrendDTO> getSalesTrend(Long storeId);
    Page<OrderDTO> getRecentOrders(Long storeId, String startDate, String endDate, int pageNumber, int pageSize);
    List<TopProductDTO> getTopSellingProducts(Long storeId, String startDate, String endDate);
}
