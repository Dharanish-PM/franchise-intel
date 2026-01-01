package com.franchiseintel.controller;

import com.franchiseintel.dto.ApiResponse;
import com.franchiseintel.dto.LoginRequest;
import com.franchiseintel.dto.LoginResponse;
import com.franchiseintel.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Login successful", response));
    }
}
