package com.franchiseintel.dto;

import com.franchiseintel.enums.BucketType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreDashboardDTO {
    private String startDate;
    private String endDate;
    private Summary summary;
    private OrdersRevenueTrend ordersRevenueTrend;
    private OrderStatusDistribution orderStatusDistribution;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long totalOrders;
        private BigDecimal totalRevenue;
        private BigDecimal avgOrderValue;
        private Long pendingOrders;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdersRevenueTrend {
        private BucketType bucketType;
        private List<String> labels;
        private List<Long> orders;
        private List<BigDecimal> revenue;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatusDistribution {
        private List<String> labels;
        private List<Long> counts;
        private List<BigDecimal> revenue;
        private List<Double> percentages;
    }
}
