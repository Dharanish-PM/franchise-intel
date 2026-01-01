package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandDashboardDTO {
    private Long todaysOrders;
    private BigDecimal totalRevenue;
    private Long inventoryItems;
    private BigDecimal avgOrderValue;
}
