package com.franchiseintel.service;

import com.franchiseintel.dto.LoginRequest;
import com.franchiseintel.dto.LoginResponse;

public interface AuthService {
    LoginResponse authenticate(LoginRequest request);
}
