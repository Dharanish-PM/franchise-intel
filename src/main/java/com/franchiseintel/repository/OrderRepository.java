package com.franchiseintel.repository;

import com.franchiseintel.entity.Order;
import com.franchiseintel.enums.BucketType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o WHERE o.franchise.id = :franchiseId " +
           "AND o.orderDate >= :startDate AND o.orderDate < :endDate")
    List<Object[]> getTodaysOrdersAndRevenueByFranchiseId(@Param("franchiseId") Long franchiseId, 
                                                           @Param("startDate") LocalDateTime startDate, 
                                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.franchise.id = :franchiseId " +
           "AND o.orderDate >= :startDate AND o.orderDate < :endDate " +
           "AND CAST(o.status AS string) = 'PENDING'")
    Long getPendingOrdersCount(@Param("franchiseId") Long franchiseId, 
                                @Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT CAST(o.status AS string), COUNT(o), COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o WHERE o.franchise.id = :franchiseId " +
           "AND o.orderDate >= :startDate AND o.orderDate < :endDate " +
           "GROUP BY o.status")
    List<Object[]> getOrdersByStatus(@Param("franchiseId") Long franchiseId, 
                                      @Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);

    
    @Query("SELECT COUNT(o), COALESCE(SUM(o.totalAmount), 0) " +
           "FROM Order o JOIN o.franchise f WHERE f.brand.id = :brandId " +
           "AND o.orderDate >= :startDate AND o.orderDate < :endDate")
    List<Object[]> getTodaysOrdersAndRevenueByBrand(@Param("brandId") Long brandId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    default List<Object[]> getOrdersRevenueTrend(Long franchiseId, LocalDateTime startDate, LocalDateTime endDate, BucketType bucketType) {
        switch (bucketType) {
            case HOURLY:
                return getOrdersRevenueTrendHourly(franchiseId, startDate, endDate);
            case DAILY:
                return getOrdersRevenueTrendDaily(franchiseId, startDate, endDate);
            case WEEKLY:
                return getOrdersRevenueTrendWeekly(franchiseId, startDate, endDate);
            case MONTHLY:
                return getOrdersRevenueTrendMonthly(franchiseId, startDate, endDate);
            case QUARTERLY:
                return getOrdersRevenueTrendQuarterly(franchiseId, startDate, endDate);
            case YEARLY:
                return getOrdersRevenueTrendYearly(franchiseId, startDate, endDate);
            default:
                return getOrdersRevenueTrendDaily(franchiseId, startDate, endDate);
        }
    }
    
    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('hour', order_date), 'HH24') || ':00', COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY DATE_TRUNC('hour', order_date) " +
           "ORDER BY DATE_TRUNC('hour', order_date)", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendHourly(@Param("franchiseId") Long franchiseId, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('day', order_date), 'Dy'), COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY DATE_TRUNC('day', order_date) " +
           "ORDER BY DATE_TRUNC('day', order_date)", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendDaily(@Param("franchiseId") Long franchiseId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    @Query(value = "SELECT 'Wk ' || TO_CHAR(DATE_TRUNC('week', order_date), 'IW'), COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY DATE_TRUNC('week', order_date) " +
           "ORDER BY DATE_TRUNC('week', order_date)", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendWeekly(@Param("franchiseId") Long franchiseId, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query(value = "SELECT TO_CHAR(DATE_TRUNC('month', order_date), 'Mon yyyy'), COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY DATE_TRUNC('month', order_date) " +
           "ORDER BY DATE_TRUNC('month', order_date)", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendMonthly(@Param("franchiseId") Long franchiseId, 
                                                @Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    @Query(value = "SELECT 'Q' || TO_CHAR(order_date, 'Q') || ' ' || TO_CHAR(order_date, 'YYYY'), COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY TO_CHAR(order_date, 'Q'), TO_CHAR(order_date, 'YYYY') " +
           "ORDER BY TO_CHAR(order_date, 'YYYY'), TO_CHAR(order_date, 'Q')", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendQuarterly(@Param("franchiseId") Long franchiseId, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query(value = "SELECT TO_CHAR(order_date, 'YYYY'), COUNT(*), COALESCE(SUM(total_amount), 0) " +
           "FROM orders WHERE franchise_id = :franchiseId " +
           "AND order_date >= :startDate AND order_date < :endDate " +
           "GROUP BY TO_CHAR(order_date, 'YYYY') " +
           "ORDER BY TO_CHAR(order_date, 'YYYY')", nativeQuery = true)
    List<Object[]> getOrdersRevenueTrendYearly(@Param("franchiseId") Long franchiseId, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT FUNCTION('TO_CHAR', o.orderDate, 'Dy'), COUNT(o) " +
           "FROM Order o JOIN o.franchise f WHERE f.brand.id = :brandId " +
           "AND o.orderDate >= :startDate " +
           "GROUP BY FUNCTION('TO_CHAR', o.orderDate, 'Dy'), FUNCTION('TO_CHAR', o.orderDate, 'D') " +
           "ORDER BY FUNCTION('TO_CHAR', o.orderDate, 'D')")
    List<Object[]> getSalesTrendByBrandId(@Param("brandId") Long brandId, 
                                           @Param("startDate") LocalDateTime startDate);
    
    Page<Order> findByFranchiseIdOrderByOrderDateDesc(Long franchiseId, Pageable pageable);
    
    Page<Order> findByFranchiseIdAndOrderDateBetweenOrderByOrderDateDesc(Long franchiseId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
