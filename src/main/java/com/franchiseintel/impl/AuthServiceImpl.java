package com.franchiseintel.impl;

import com.franchiseintel.dto.LoginRequest;
import com.franchiseintel.dto.LoginResponse;
import com.franchiseintel.entity.AppUser;
import com.franchiseintel.exception.CustomException;
import com.franchiseintel.repository.AppUserRepository;
import com.franchiseintel.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository appUserRepository;

    @Override
    public LoginResponse authenticate(LoginRequest request) {
        AppUser user = appUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("Invalid username or password"));

        if (!user.getPasswordHash().equals(request.getPassword())) {
            throw new CustomException("Invalid username or password");
        }

        if (!user.getIsActive()) {
            throw new CustomException("User account is inactive");
        }

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setBrandId(user.getBrand().getId());
        response.setFranchiseId(user.getFranchise() != null ? user.getFranchise().getId() : null);
        response.setIsActive(user.getIsActive());

        log.info("User {} logged in successfully with role {}", user.getUsername(), user.getRole());
        return response;
    }
}
