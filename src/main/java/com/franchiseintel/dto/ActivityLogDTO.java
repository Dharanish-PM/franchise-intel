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
public class ActivityLogDTO {
    private Long id;
    private String action;
    private LocalDateTime timestamp;
    private String userId;
    private String userRole;
    private String entityType;
    private Long entityId;
    private String details;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

