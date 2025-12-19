package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreDTO {
    private Long id;
    private String storeName;
    private String address;
    private String phoneNumber;
    private String emailAddress;
    private Boolean operationalStatus;
    private String storeImage;
    private String storeWebsite;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private List<FranchiseDTO> franchises;
}

