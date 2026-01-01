package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandInfoDTO {
    private Long id;
    private String name;
    private String industry;
    private String imageUrl;
    private String websiteUrl;
    private String address;
    private String contact;
    private Long franchiseCount;
}
