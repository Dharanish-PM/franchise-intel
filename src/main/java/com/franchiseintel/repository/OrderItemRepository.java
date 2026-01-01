package com.franchiseintel.repository;

import com.franchiseintel.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    @Query("SELECT oi.product.id, oi.product.name, oi.product.category, oi.product.price, SUM(oi.quantity) " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.franchise.id = :franchiseId " +
           "AND o.orderDate >= :startDate AND o.orderDate < :endDate " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.category, oi.product.price " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProductsByFranchise(@Param("franchiseId") Long franchiseId,
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);
}
