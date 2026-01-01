package com.franchiseintel.repository;

import com.franchiseintel.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY FUNCTION('RANDOM')")
    List<Product> findRandomProducts(Pageable pageable);
    
    List<Product> findByNameContainingIgnoreCase(String name);
    
    @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId AND p.isActive = true ORDER BY FUNCTION('RANDOM')")
    List<Product> findRandomProductsByBrandId(@Param("brandId") Long brandId, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.isActive = true")
    List<Product> findByBrandIdAndNameContainingIgnoreCase(@Param("brandId") Long brandId, @Param("name") String name);
}
