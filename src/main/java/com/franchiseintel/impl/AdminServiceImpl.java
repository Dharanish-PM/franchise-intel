package com.franchiseintel.impl;

import com.franchiseintel.dto.BrandInfoDTO;
import com.franchiseintel.dto.PaginatedResponse;
import com.franchiseintel.entity.*;
import com.franchiseintel.repository.*;
import com.franchiseintel.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final BrandRepository brandRepository;

    @Override
    public PaginatedResponse<BrandInfoDTO> getAllBrandsWithFranchiseCount(int pageNumber, int pageSize) {
        Page<Object[]> page = brandRepository.findAllBrandsWithFranchiseCount(PageRequest.of(pageNumber, pageSize));
        
        List<BrandInfoDTO> content = page.getContent().stream().map(row -> 
            new BrandInfoDTO((Long) row[0], (String) row[1], (String) row[2], 
                           (String) row[3], (String) row[4], (String) row[5], 
                           (String) row[6], (Long) row[7])
        ).collect(Collectors.toList());
        
        return new PaginatedResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast()
        );
    }
}
