package com.franchiseintel.repository;

import com.franchiseintel.entity.InventoryRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRequestRepository extends JpaRepository<InventoryRequest, UUID> {
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(ir.requestNumber, LOCATE('-', ir.requestNumber, LOCATE('-', ir.requestNumber) + 1) + 1, LENGTH(ir.requestNumber)) AS int)), 0) FROM InventoryRequest ir WHERE ir.requestNumber LIKE :prefix")
    Integer findMaxRequestNumberByPrefix(String prefix);
}
