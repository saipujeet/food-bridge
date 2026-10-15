package com.foodbridge.backend.history.controller;

import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.history.dto.AuditLogDto;
import com.foodbridge.backend.history.dto.CreateDeliveryEventRequest;
import com.foodbridge.backend.history.dto.CreateDonationEventRequest;
import com.foodbridge.backend.history.dto.DeliveryHistoryEventDto;
import com.foodbridge.backend.history.dto.DonationHistoryEventDto;
import com.foodbridge.backend.history.entity.DeliveryHistoryEvent;
import com.foodbridge.backend.history.entity.DonationHistoryEvent;
import com.foodbridge.backend.history.service.HistoryService;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;
    private final UserRepository userRepository;
    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;

    public HistoryController(
            HistoryService historyService,
            UserRepository userRepository,
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository) {
        this.historyService = historyService;
        this.userRepository = userRepository;
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("User not found in system database."));
    }

    // ==========================================
    // 1. DONATION HISTORY ENDPOINTS
    // ==========================================

    @GetMapping("/donations")
    @PreAuthorize("hasAnyRole('DONOR', 'NGO', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<DonationHistoryEventDto>>> getDonationHistory(
            @RequestParam(required = false) Long donationId,
            @RequestParam(required = false) String donationCode,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        LocalDateTime fromTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toTime = to != null ? to.atTime(LocalTime.MAX) : null;

        Page<DonationHistoryEventDto> result = historyService.getDonationHistory(
                currentUser,
                donationId,
                donationCode,
                eventType,
                status,
                fromTime,
                toTime,
                PageRequest.of(page, size)
        );

        return ResponseEntity.ok(ApiResponse.ok("Donation history retrieved", result));
    }

    @GetMapping("/donations/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'NGO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DonationHistoryEventDto>>> getDonationTimeline(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        List<DonationHistoryEventDto> timeline = historyService.getDonationTimeline(currentUser, id);
        return ResponseEntity.ok(ApiResponse.ok("Donation event timeline retrieved", timeline));
    }

    @PostMapping("/donations/{id}/events")
    @PreAuthorize("hasAnyRole('DONOR', 'NGO', 'ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<DonationHistoryEventDto>> recordDonationEvent(
            @PathVariable Long id,
            @RequestBody CreateDonationEventRequest request,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        DonationRecord don = donationRecordRepository.findById(id).orElse(null);

        Long donorId = don != null ? don.getDonorId() : currentUser.getId();
        String donationCode = don != null ? don.getDonationCode() : ("DON-" + id);
        Long ngoId = don != null ? don.getMatchedNgoId() : null;

        DonationHistoryEvent saved = historyService.recordDonationEvent(
                id,
                donationCode,
                donorId,
                ngoId,
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getRole().name(),
                request.getEventType(),
                request.getPreviousStatus(),
                request.getNewStatus(),
                request.getDescription(),
                request.getCorrelationId()
        );

        return ResponseEntity.ok(ApiResponse.ok("Donation lifecycle event recorded successfully", new DonationHistoryEventDto(saved)));
    }

    // ==========================================
    // 2. DELIVERY HISTORY ENDPOINTS
    // ==========================================

    @GetMapping("/deliveries")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'NGO', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<DeliveryHistoryEventDto>>> getDeliveryHistory(
            @RequestParam(required = false) Long deliveryId,
            @RequestParam(required = false) String deliveryCode,
            @RequestParam(required = false) Long donationId,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        LocalDateTime fromTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toTime = to != null ? to.atTime(LocalTime.MAX) : null;

        Page<DeliveryHistoryEventDto> result = historyService.getDeliveryHistory(
                currentUser,
                deliveryId,
                deliveryCode,
                donationId,
                eventType,
                status,
                fromTime,
                toTime,
                PageRequest.of(page, size)
        );

        return ResponseEntity.ok(ApiResponse.ok("Delivery history retrieved", result));
    }

    @GetMapping("/deliveries/{id}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'NGO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DeliveryHistoryEventDto>>> getDeliveryTimeline(
            @PathVariable Long id,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        List<DeliveryHistoryEventDto> timeline = historyService.getDeliveryTimeline(currentUser, id);
        return ResponseEntity.ok(ApiResponse.ok("Delivery milestone timeline retrieved", timeline));
    }

    @PostMapping("/deliveries/{id}/events")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'NGO', 'ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryHistoryEventDto>> recordDeliveryEvent(
            @PathVariable Long id,
            @RequestBody CreateDeliveryEventRequest request,
            Authentication authentication) {

        User currentUser = getAuthenticatedUser(authentication);
        DeliveryRecord del = deliveryRecordRepository.findById(id).orElse(null);

        String deliveryCode = del != null ? del.getDeliveryCode() : ("DEL-" + id);
        Long donationId = del != null ? del.getDonationId() : null;
        String donationCode = del != null ? del.getDonationCode() : null;
        Long volunteerId = del != null ? del.getVolunteerId() : (currentUser.getRole() == Role.VOLUNTEER ? currentUser.getId() : null);
        Long ngoId = null;

        DeliveryHistoryEvent saved = historyService.recordDeliveryEvent(
                id,
                deliveryCode,
                donationId,
                donationCode,
                volunteerId,
                ngoId,
                currentUser.getId(),
                currentUser.getEmail(),
                currentUser.getRole().name(),
                request.getEventType(),
                request.getPreviousStatus(),
                request.getNewStatus(),
                request.getDescription(),
                request.getCorrelationId()
        );

        return ResponseEntity.ok(ApiResponse.ok("Delivery milestone event recorded successfully", new DeliveryHistoryEventDto(saved)));
    }

    // ==========================================
    // 3. ADMIN AUDIT TRAIL ENDPOINT
    // ==========================================

    @GetMapping("/admin/audit-trail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAdminAuditTrail(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDateTime fromTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toTime = to != null ? to.atTime(LocalTime.MAX) : null;

        Page<AuditLogDto> auditTrail = historyService.getAdminAuditTrail(
                entityType,
                action,
                actorRole,
                search,
                fromTime,
                toTime,
                PageRequest.of(page, size)
        );

        return ResponseEntity.ok(ApiResponse.ok("Administrative audit trail retrieved", auditTrail));
    }
}
