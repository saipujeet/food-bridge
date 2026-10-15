package com.foodbridge.backend.analytics.controller;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.analytics.dto.*;
import com.foodbridge.backend.analytics.service.AnalyticsService;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminOverviewDto>> getAdminOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        AdminOverviewDto overview = analyticsService.getAdminOverview(from, to);
        return ResponseEntity.ok(ApiResponse.ok("Admin overview analytics retrieved", overview));
    }

    @GetMapping("/admin/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TrendPointDto>>> getAdminTrends(
            @RequestParam(defaultValue = "week") String period) {

        List<TrendPointDto> trends = analyticsService.getAdminTrends(period);
        return ResponseEntity.ok(ApiResponse.ok("Admin trend points retrieved", trends));
    }

    @GetMapping("/admin/distribution-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DistributionStatusDto>>> getAdminDistributionStatus() {
        List<DistributionStatusDto> status = analyticsService.getAdminDistributionStatus();
        return ResponseEntity.ok(ApiResponse.ok("Distribution status breakdown retrieved", status));
    }

    @GetMapping("/ngo/overview")
    public ResponseEntity<ApiResponse<NGOOverviewDto>> getNGOOverview(
            Authentication authentication,
            @RequestParam(required = false) Long ngoId) {

        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated request"));
        }

        Long targetNgoId = currentUser.getId();
        if (currentUser.getRole() == Role.ADMIN && ngoId != null) {
            targetNgoId = ngoId;
        } else if (currentUser.getRole() != Role.NGO) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access forbidden: NGO role required"));
        }

        NGOOverviewDto dto = analyticsService.getNGOOverview(targetNgoId);
        return ResponseEntity.ok(ApiResponse.ok("NGO dashboard analytics retrieved", dto));
    }

    @GetMapping("/donor/overview")
    public ResponseEntity<ApiResponse<DonorOverviewDto>> getDonorOverview(
            Authentication authentication,
            @RequestParam(required = false) Long donorId) {

        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated request"));
        }

        Long targetDonorId = currentUser.getId();
        if (currentUser.getRole() == Role.ADMIN && donorId != null) {
            targetDonorId = donorId;
        } else if (currentUser.getRole() != Role.DONOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access forbidden: Donor role required"));
        }

        DonorOverviewDto dto = analyticsService.getDonorOverview(targetDonorId);
        return ResponseEntity.ok(ApiResponse.ok("Donor dashboard analytics retrieved", dto));
    }

    @GetMapping("/volunteer/overview")
    public ResponseEntity<ApiResponse<VolunteerOverviewDto>> getVolunteerOverview(
            Authentication authentication,
            @RequestParam(required = false) Long volunteerId) {

        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated request"));
        }

        Long targetVolunteerId = currentUser.getId();
        if (currentUser.getRole() == Role.ADMIN && volunteerId != null) {
            targetVolunteerId = volunteerId;
        } else if (currentUser.getRole() != Role.VOLUNTEER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access forbidden: Volunteer role required"));
        }

        VolunteerOverviewDto dto = analyticsService.getVolunteerOverview(targetVolunteerId);
        return ResponseEntity.ok(ApiResponse.ok("Volunteer dashboard analytics retrieved", dto));
    }

    @GetMapping("/donations/history")
    public ResponseEntity<ApiResponse<List<DonationRecord>>> getDonationsHistory(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated request"));
        }

        List<DonationRecord> list = analyticsService.getDonationsHistory(currentUser, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Historical donations retrieved", list));
    }

    @GetMapping("/deliveries/history")
    public ResponseEntity<ApiResponse<List<DeliveryRecord>>> getDeliveriesHistory(
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        User currentUser = getAuthenticatedUser(authentication);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated request"));
        }

        List<DeliveryRecord> list = analyticsService.getDeliveriesHistory(currentUser, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Historical deliveries retrieved", list));
    }
}
