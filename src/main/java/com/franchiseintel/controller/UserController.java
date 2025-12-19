package com.franchiseintel.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.service.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user-controller")
public class UserController {

    private final AwsS3Service awsS3Service;
    private final ObjectMapper objectMapper;

    public UserController(AwsS3Service awsS3Service, ObjectMapper objectMapper) {
        this.awsS3Service = awsS3Service;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            Object data = awsS3Service.fetchAndDeserializeGzipFile(
                    "users-data.gz",
                    new TypeReference<Object>() {}
            );
            
            List<Map<String, Object>> users;
            if (data instanceof List) {
                users = (List<Map<String, Object>>) data;
            } else if (data instanceof Map) {
                Map<String, Object> dataMap = (Map<String, Object>) data;
                Object usersData = dataMap.get("users");
                if (usersData == null) {
                    usersData = dataMap.get("data");
                }
                users = usersData != null ? (List<Map<String, Object>>) usersData : List.of(dataMap);
            } else {
                users = List.of();
            }
            
            return ResponseEntity.ok(new ApiResponse(200, "Users retrieved successfully from S3", users, null));
        } catch (Exception e) {
            log.error("Error retrieving users from S3", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(500, "Error retrieving users from S3", null, new String[]{e.getMessage()}));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable String id) {
        try {
            Object data = awsS3Service.fetchAndDeserializeGzipFile(
                    "user-json.gz", 
                    new TypeReference<Object>() {}
            );
            
            List<Map<String, Object>> users;
            if (data instanceof List) {
                users = (List<Map<String, Object>>) data;
            } else if (data instanceof Map) {
                Map<String, Object> dataMap = (Map<String, Object>) data;
                Object usersData = dataMap.get("users");
                if (usersData == null) {
                    usersData = dataMap.get("data");
                }
                users = usersData != null ? (List<Map<String, Object>>) usersData : List.of(dataMap);
            } else {
                users = List.of();
            }
            
            Map<String, Object> user = users.stream()
                    .filter(u -> id.equals(String.valueOf(u.get("id"))))
                    .findFirst()
                    .orElse(null);
            
            if (user != null) {
                return ResponseEntity.ok(new ApiResponse(200, "User retrieved successfully", user, null));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse(404, "User not found", null, null));
            }
        } catch (Exception e) {
            log.error("Error retrieving user with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(500, "Error retrieving user", null, new String[]{e.getMessage()}));
        }
    }
}