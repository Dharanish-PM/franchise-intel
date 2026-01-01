package com.franchiseintel.repository;

import com.franchiseintel.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    
    @Query("SELECT b.id, b.name, b.industry, b.imageUrl, b.websiteUrl, b.address, b.contact, COUNT(f.id) " +
           "FROM Brand b LEFT JOIN Franchise f ON f.brand.id = b.id " +
           "GROUP BY b.id, b.name, b.industry, b.imageUrl, b.websiteUrl, b.address, b.contact")
    Page<Object[]> findAllBrandsWithFranchiseCount(Pageable pageable);
}
