package com.franchiseintel.repository;

import com.franchiseintel.entity.InventoryRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRequestItemRepository extends JpaRepository<InventoryRequestItem, UUID> {
}
