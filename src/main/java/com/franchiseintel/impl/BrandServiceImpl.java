package com.franchiseintel.impl;

import com.franchiseintel.dto.BrandDashboardDTO;
import com.franchiseintel.dto.SalesTrendDTO;
import com.franchiseintel.exception.CustomException;
import com.franchiseintel.repository.BrandRepository;
import com.franchiseintel.repository.InventoryRepository;
import com.franchiseintel.repository.OrderRepository;
import com.franchiseintel.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final OrderRepository orderRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public BrandDashboardDTO getBrandDashboard(Long brandId) {
        if (!brandRepository.existsById(brandId)) {
            throw new CustomException("Brand not found with ID: " + brandId);
        }

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.now().plusDays(1).with(LocalTime.MIN);

        List<Object[]> orderDataList = orderRepository.getTodaysOrdersAndRevenueByBrand(brandId, startOfDay, endOfDay);
        Object[] orderData = orderDataList.isEmpty() ? new Object[]{0L, BigDecimal.ZERO} : orderDataList.get(0);
        Long todaysOrders = ((Number) orderData[0]).longValue();
        BigDecimal totalRevenue = (BigDecimal) orderData[1];

        Long inventoryItems = inventoryRepository.countByBrandId(brandId);

        BigDecimal avgOrderValue = todaysOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(todaysOrders), 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        return new BrandDashboardDTO(todaysOrders, totalRevenue, inventoryItems, avgOrderValue);
    }

    @Override
    public List<SalesTrendDTO> getSalesTrend(Long brandId) {
        if (!brandRepository.existsById(brandId)) {
            throw new CustomException("Brand not found with ID: " + brandId);
        }

        LocalDateTime startDate = LocalDateTime.now().minusDays(6).with(LocalTime.MIN);
        List<Object[]> results = orderRepository.getSalesTrendByBrandId(brandId, startDate);

        return results.stream()
                .map(row -> new SalesTrendDTO((String) row[0], ((Number) row[1]).longValue()))
                .collect(java.util.stream.Collectors.toList());
    }
}
