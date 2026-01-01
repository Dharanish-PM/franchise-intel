package com.franchiseintel.repository;

import com.franchiseintel.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.franchise.id = :storeId")
    Long countByFranchiseId(@Param("storeId") Long storeId);
    
    @Query("SELECT COUNT(i) FROM Inventory i JOIN i.franchise f WHERE f.brand.id = :brandId")
    Long countByBrandId(@Param("brandId") Long brandId);
    
    @Query("SELECT COALESCE(SUM(i.quantityAvailable * i.product.price), 0) FROM Inventory i WHERE i.franchise.id = :storeId")
    BigDecimal getTotalValueByFranchiseId(@Param("storeId") Long storeId);
    
    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.franchise.id = :storeId AND i.quantityAvailable < i.minStock AND i.quantityAvailable!=0 ")
    Long countLowStockByFranchiseId(@Param("storeId") Long storeId);
    
    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.franchise.id = :storeId AND i.quantityAvailable = 0")
    Long countOutOfStockByFranchiseId(@Param("storeId") Long storeId);
    
    List<Inventory> findByFranchiseId(Long storeId);
    
    @Query("SELECT i FROM Inventory i WHERE i.franchise.id = :storeId AND (:search IS NULL OR :search = '' OR LOWER(i.product.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Inventory> findByFranchiseIdWithSearch(@Param("storeId") Long storeId, @Param("search") String search, Pageable pageable);
    
    @Query("SELECT i FROM Inventory i ORDER BY FUNCTION('RANDOM')")
    List<Inventory> findRandomInventoryItems(Pageable pageable);
    
    @Query("SELECT i FROM Inventory i WHERE LOWER(i.product.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Inventory> findByProductNameContainingIgnoreCase(@Param("name") String name);
}
