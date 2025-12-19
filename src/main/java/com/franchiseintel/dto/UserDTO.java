package com.franchiseintel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private String status;
    private String departmentOrRegion;
    private String profileImageUrl;
    private LocalDateTime lastLoginDate;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

