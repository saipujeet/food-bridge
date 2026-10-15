package com.foodbridge.backend.admin.controller;

import com.foodbridge.backend.admin.dto.AdminDashboardSummaryDto;
import com.foodbridge.backend.admin.dto.SettingUpdateRequest;
import com.foodbridge.backend.admin.dto.StatusUpdateRequest;
import com.foodbridge.backend.admin.entity.*;
import com.foodbridge.backend.admin.service.AdminService;
import com.foodbridge.backend.auth.dto.UserDto;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.security.JwtTokenProvider;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedAdmin(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "admin@foodbridge.org";
        return userRepository.findByEmail(email)
                .orElse(new User(1L, "admin@foodbridge.org", "admin123", "System Administrator", Role.ADMIN, null, true, null));
    }

    // Dashboard
    @GetMapping("/dashboard/summary")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryDto>> getDashboardSummary() {
        AdminDashboardSummaryDto summary = adminService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/dashboard/recent-activity")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getRecentActivity() {
        List<AuditLog> activities = adminService.getRecentActivity();
        return ResponseEntity.ok(ApiResponse.ok(activities));
    }

    // NGO Management
    @GetMapping("/ngos")
    public ResponseEntity<ApiResponse<List<UserDto>>> getNgos(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search) {
        List<UserDto> ngos = adminService.getNgos(status, search);
        return ResponseEntity.ok(ApiResponse.ok(ngos));
    }

    @GetMapping("/ngos/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getNgoById(@PathVariable Long id) {
        UserDto ngo = adminService.getNgoById(id);
        return ResponseEntity.ok(ApiResponse.ok(ngo));
    }

    @PatchMapping("/ngos/{id}/verify")
    public ResponseEntity<ApiResponse<UserDto>> verifyNgo(@PathVariable Long id, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        UserDto updated = adminService.verifyNgo(id, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("NGO application successfully verified and approved.", updated));
    }

    @PatchMapping("/ngos/{id}/reject")
    public ResponseEntity<ApiResponse<UserDto>> rejectNgo(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        String reason = request != null ? request.getReason() : "Application rejected by administrator";
        UserDto updated = adminService.rejectNgo(id, reason, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("NGO application rejected.", updated));
    }

    @PatchMapping("/ngos/{id}/suspend")
    public ResponseEntity<ApiResponse<UserDto>> suspendNgo(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        String reason = request != null ? request.getReason() : "Organization suspended by administrator";
        UserDto updated = adminService.suspendNgo(id, reason, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("NGO organization suspended.", updated));
    }

    // Volunteer Management
    @GetMapping("/volunteers")
    public ResponseEntity<ApiResponse<List<UserDto>>> getVolunteers(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search) {
        List<UserDto> volunteers = adminService.getVolunteers(status, search);
        return ResponseEntity.ok(ApiResponse.ok(volunteers));
    }

    @GetMapping("/volunteers/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getVolunteerById(@PathVariable Long id) {
        UserDto vol = adminService.getVolunteerById(id);
        return ResponseEntity.ok(ApiResponse.ok(vol));
    }

    @PatchMapping("/volunteers/{id}/verify")
    public ResponseEntity<ApiResponse<UserDto>> verifyVolunteer(@PathVariable Long id, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        UserDto updated = adminService.verifyVolunteer(id, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Volunteer credentials verified.", updated));
    }

    @PatchMapping("/volunteers/{id}/reject")
    public ResponseEntity<ApiResponse<UserDto>> rejectVolunteer(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        String reason = request != null ? request.getReason() : "Volunteer application rejected";
        UserDto updated = adminService.rejectVolunteer(id, reason, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Volunteer application rejected.", updated));
    }

    @PatchMapping("/volunteers/{id}/suspend")
    public ResponseEntity<ApiResponse<UserDto>> suspendVolunteer(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        String reason = request != null ? request.getReason() : "Volunteer suspended by administrator";
        UserDto updated = adminService.suspendVolunteer(id, reason, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Volunteer suspended.", updated));
    }

    // User Directory
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        List<UserDto> users = adminService.getUsers(role, active, search);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = adminService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<UserDto>> suspendUser(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        String reason = request != null ? request.getReason() : "Account suspended by administrator";
        UserDto updated = adminService.suspendUser(id, reason, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("User account suspended.", updated));
    }

    @PatchMapping("/users/{id}/reactivate")
    public ResponseEntity<ApiResponse<UserDto>> reactivateUser(@PathVariable Long id, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        UserDto updated = adminService.reactivateUser(id, admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("User account reactivated.", updated));
    }

    // Monitoring: Donations, Matches, Deliveries
    @GetMapping("/donations")
    public ResponseEntity<ApiResponse<List<DonationRecord>>> getDonations(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) String search) {
        List<DonationRecord> list = adminService.getDonations(status, search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/matches")
    public ResponseEntity<ApiResponse<List<MatchRecord>>> getMatches(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        List<MatchRecord> list = adminService.getMatches(status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<DeliveryRecord>>> getDeliveries(
            @RequestParam(required = false, defaultValue = "ALL") String status) {
        List<DeliveryRecord> list = adminService.getDeliveries(status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // Issues & Reports
    @GetMapping("/issues")
    public ResponseEntity<ApiResponse<List<SystemIssue>>> getIssues(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String category) {
        List<SystemIssue> list = adminService.getIssues(status, category);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/issues/{id}/status")
    public ResponseEntity<ApiResponse<SystemIssue>> updateIssueStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        SystemIssue updated = adminService.updateIssueStatus(id, request.getStatus(), request.getNotes(), admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Issue status updated.", updated));
    }

    // System Settings
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getSettings() {
        List<SystemSetting> list = adminService.getSettings();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/settings/{key}")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @RequestBody SettingUpdateRequest request,
            Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        SystemSetting updated = adminService.updateSetting(key, request.getValue(), admin.getId(), admin.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Setting updated successfully.", updated));
    }

    // Audit Logs
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = adminService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
