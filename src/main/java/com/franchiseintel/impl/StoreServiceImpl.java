package com.franchiseintel.impl;

import com.franchiseintel.dto.OrderDTO;
import com.franchiseintel.dto.SalesTrendDTO;
import com.franchiseintel.dto.StoreDashboardDTO;
import com.franchiseintel.dto.TopProductDTO;
import com.franchiseintel.entity.Order;
import com.franchiseintel.enums.BucketType;
import com.franchiseintel.exception.CustomException;
import com.franchiseintel.repository.FranchiseRepository;
import com.franchiseintel.repository.InventoryRepository;
import com.franchiseintel.repository.OrderItemRepository;
import com.franchiseintel.repository.OrderRepository;
import com.franchiseintel.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final FranchiseRepository franchiseRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public StoreDashboardDTO getStoreDashboard(Long storeId, String startDate, String endDate) {
        var franchise = franchiseRepository.findById(storeId)
            .orElseThrow(() -> new CustomException("Store not found with ID: " + storeId));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate startDateParsed;
        LocalDate endDateParsed;
        
        if (startDate == null && endDate == null) {
            startDateParsed = franchise.getOpenedDate();
            endDateParsed = LocalDate.now();
        } else {
            startDateParsed = (startDate != null) ? LocalDate.parse(startDate, formatter) : LocalDate.now().minusDays(6);
            endDateParsed = (endDate != null) ? LocalDate.parse(endDate, formatter) : LocalDate.now();
        }
        
        LocalDateTime start = startDateParsed.atStartOfDay();
        LocalDateTime end = endDateParsed.plusDays(1).atStartOfDay();
        
        long daysBetween = ChronoUnit.DAYS.between(startDateParsed, endDateParsed) + 1;
        BucketType bucketType = determineBucketType(daysBetween);

        // Summary
        List<Object[]> orderDataList = orderRepository.getTodaysOrdersAndRevenueByFranchiseId(storeId, start, end);
        Object[] orderData = orderDataList.isEmpty() ? new Object[]{0L, BigDecimal.ZERO} : orderDataList.get(0);
        Long totalOrders = ((Number) orderData[0]).longValue();
        BigDecimal totalRevenue = (BigDecimal) orderData[1];
        BigDecimal avgOrderValue = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
        Long pendingOrders = orderRepository.getPendingOrdersCount(storeId, start, end);
        StoreDashboardDTO.Summary summary = new StoreDashboardDTO.Summary(totalOrders, totalRevenue, avgOrderValue, pendingOrders);

        // Orders Revenue Trend
        List<Object[]> trendData = orderRepository.getOrdersRevenueTrend(storeId, start, end, bucketType);
        Map<String, Object[]> dataMap = trendData.stream().collect(Collectors.toMap(row -> (String) row[0], row -> row));
        
        List<String> labels = generateLabels(bucketType, startDateParsed, endDateParsed);
        List<Long> orders = new ArrayList<>();
        List<BigDecimal> revenue = new ArrayList<>();
        
        for (String label : labels) {
            Object[] data = dataMap.get(label);
            orders.add(data != null ? ((Number) data[1]).longValue() : 0L);
            revenue.add(data != null ? (BigDecimal) data[2] : BigDecimal.ZERO);
        }
        
        StoreDashboardDTO.OrdersRevenueTrend ordersRevenueTrend = new StoreDashboardDTO.OrdersRevenueTrend(bucketType, labels, orders, revenue);

        // Order Status Distribution
        List<Object[]> statusData = orderRepository.getOrdersByStatus(storeId, start, end);
        List<String> statusLabels = new java.util.ArrayList<>();
        List<Long> statusCounts = new java.util.ArrayList<>();
        List<BigDecimal> statusRevenue = new java.util.ArrayList<>();
        List<Double> percentages = new java.util.ArrayList<>();
        for (Object[] row : statusData) {
            statusLabels.add(row[0] != null ? row[0].toString() : "UNKNOWN");
            Long count = ((Number) row[1]).longValue();
            statusCounts.add(count);
            statusRevenue.add((BigDecimal) row[2]);
            percentages.add(totalOrders > 0 ? (count * 100.0 / totalOrders) : 0.0);
        }
        StoreDashboardDTO.OrderStatusDistribution orderStatusDistribution = new StoreDashboardDTO.OrderStatusDistribution(statusLabels, statusCounts, statusRevenue, percentages);

        return new StoreDashboardDTO(
            startDateParsed.format(formatter),
            endDateParsed.format(formatter),
            summary, 
            ordersRevenueTrend, 
            orderStatusDistribution
        );
    }

    @Override
    public List<SalesTrendDTO> getSalesTrend(Long storeId) {
        if (!franchiseRepository.existsById(storeId)) {
            throw new CustomException("Store not found with ID: " + storeId);
        }

        LocalDateTime startDate = LocalDateTime.now().minusDays(6).with(LocalTime.MIN);
        LocalDateTime endDate = LocalDateTime.now().plusDays(1).with(LocalTime.MIN);
        List<Object[]> results = orderRepository.getOrdersRevenueTrend(storeId, startDate, endDate, BucketType.DAILY);

        return results.stream()
                .map(row -> new SalesTrendDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Override
    public Page<OrderDTO> getRecentOrders(Long storeId, String startDate, String endDate, int pageNumber, int pageSize) {
        var franchise = franchiseRepository.findById(storeId)
            .orElseThrow(() -> new CustomException("Store not found with ID: " + storeId));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate startDateParsed;
        LocalDate endDateParsed;
        
        if (startDate == null && endDate == null) {
            startDateParsed = franchise.getOpenedDate();
            endDateParsed = LocalDate.now();
        } else {
            startDateParsed = (startDate != null) ? LocalDate.parse(startDate, formatter) : LocalDate.now().minusDays(6);
            endDateParsed = (endDate != null) ? LocalDate.parse(endDate, formatter) : LocalDate.now();
        }
        
        LocalDateTime start = startDateParsed.atStartOfDay();
        LocalDateTime end = endDateParsed.plusDays(1).atStartOfDay();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Order> orders = orderRepository.findByFranchiseIdAndOrderDateBetweenOrderByOrderDateDesc(storeId, start, end, pageable);
        return orders.map(order -> new OrderDTO(
            order.getId(),
            order.getFranchise().getId(),
            order.getFranchise().getFranchiseCode(),
            order.getCustomer() != null ? order.getCustomer().getId() : null,
            order.getCustomer() != null ? order.getCustomer().getName() : null,
            order.getOrderDate(),
            order.getTotalAmount(),
            order.getPaymentMode(),
            order.getStatus()
        ));
    }
    
    @Override
    public List<TopProductDTO> getTopSellingProducts(Long storeId, String startDate, String endDate) {
        var franchise = franchiseRepository.findById(storeId)
            .orElseThrow(() -> new CustomException("Store not found with ID: " + storeId));
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        LocalDate startDateParsed;
        LocalDate endDateParsed;
        
        if (startDate == null && endDate == null) {
            startDateParsed = franchise.getOpenedDate();
            endDateParsed = LocalDate.now();
        } else {
            startDateParsed = (startDate != null) ? LocalDate.parse(startDate, formatter) : LocalDate.now().minusDays(6);
            endDateParsed = (endDate != null) ? LocalDate.parse(endDate, formatter) : LocalDate.now();
        }
        
        LocalDateTime start = startDateParsed.atStartOfDay();
        LocalDateTime end = endDateParsed.plusDays(1).atStartOfDay();
        
        List<Object[]> results = orderItemRepository.findTopSellingProductsByFranchise(storeId, start, end);
        return results.stream()
            .limit(10)
            .map(row -> new TopProductDTO(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                (BigDecimal) row[3],
                ((Number) row[4]).longValue()
            ))
            .collect(Collectors.toList());
    }
    
    private BucketType determineBucketType(long days) {
        if (days <= 7) return BucketType.DAILY;
        if (days <= 31) return BucketType.DAILY;
        if (days <= 90) return BucketType.WEEKLY;
        if (days <= 365) return BucketType.MONTHLY;
        if (days <= 1095) return BucketType.QUARTERLY;
        return BucketType.YEARLY;
    }
    
    private List<String> generateLabels(BucketType bucketType, LocalDate start, LocalDate end) {
        List<String> labels = new ArrayList<>();
        switch (bucketType) {
            case HOURLY:
                for (int h = 0; h < 24; h++) {
                    labels.add(String.format("%02d:00", h));
                }
                break;
            case DAILY:
                for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
                    labels.add(d.format(DateTimeFormatter.ofPattern("EEE")));
                }
                break;
            case WEEKLY:
                LocalDate weekStart = start;
                while (!weekStart.isAfter(end)) {
                    labels.add("Wk " + weekStart.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
                    weekStart = weekStart.plusWeeks(1);
                }
                break;
            case MONTHLY:
                for (LocalDate m = start.withDayOfMonth(1); !m.isAfter(end); m = m.plusMonths(1)) {
                    labels.add(m.format(DateTimeFormatter.ofPattern("MMM yyyy")));
                }
                break;
            case QUARTERLY:
                LocalDate qStart = start.withDayOfMonth(1).with(start.getMonth().firstMonthOfQuarter());
                while (!qStart.isAfter(end)) {
                    labels.add("Q" + qStart.get(IsoFields.QUARTER_OF_YEAR) + " " + qStart.getYear());
                    qStart = qStart.plusMonths(3);
                }
                break;
            case YEARLY:
                for (int year = start.getYear(); year <= end.getYear(); year++) {
                    labels.add(String.valueOf(year));
                }
                break;
        }
        return labels;
    }
}
