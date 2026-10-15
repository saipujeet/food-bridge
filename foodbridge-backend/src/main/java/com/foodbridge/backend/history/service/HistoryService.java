package com.foodbridge.backend.history.service;

import com.foodbridge.backend.admin.entity.AuditLog;
import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.repository.AuditLogRepository;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
import com.foodbridge.backend.history.dto.AuditLogDto;
import com.foodbridge.backend.history.dto.DeliveryHistoryEventDto;
import com.foodbridge.backend.history.dto.DonationHistoryEventDto;
import com.foodbridge.backend.history.entity.DeliveryHistoryEvent;
import com.foodbridge.backend.history.entity.DonationHistoryEvent;
import com.foodbridge.backend.history.repository.DeliveryHistoryEventRepository;
import com.foodbridge.backend.history.repository.DonationHistoryEventRepository;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class HistoryService {

    private static final Logger log = LoggerFactory.getLogger(HistoryService.class);

    private final DonationHistoryEventRepository donationEventRepository;
    private final DeliveryHistoryEventRepository deliveryEventRepository;
    private final AuditLogRepository auditLogRepository;
    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;

    public HistoryService(
            DonationHistoryEventRepository donationEventRepository,
            DeliveryHistoryEventRepository deliveryEventRepository,
            AuditLogRepository auditLogRepository,
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository) {
        this.donationEventRepository = donationEventRepository;
        this.deliveryEventRepository = deliveryEventRepository;
        this.auditLogRepository = auditLogRepository;
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
    }

    // ==========================================
    // 1. EVENT RECORDING (Transactional)
    // ==========================================

    public DonationHistoryEvent recordDonationEvent(
            Long donationId,
            String donationCode,
            Long donorId,
            Long matchedNgoId,
            Long actorId,
            String actorEmail,
            String actorRole,
            String eventType,
            String previousStatus,
            String newStatus,
            String description,
            String correlationId) {

        String corrId = (correlationId != null && !correlationId.trim().isEmpty())
                ? correlationId.trim()
                : UUID.randomUUID().toString();

        DonationHistoryEvent event = new DonationHistoryEvent(
                donationId,
                donationCode,
                donorId,
                matchedNgoId,
                actorId,
                actorEmail,
                actorRole,
                eventType,
                previousStatus,
                newStatus,
                sanitizeText(description),
                corrId
        );

        DonationHistoryEvent savedEvent = donationEventRepository.save(event);

        // Also record an audit log entry for this lifecycle change
        AuditLog audit = new AuditLog(
                actorId,
                actorEmail != null ? actorEmail : "system@foodbridge.org",
                actorRole != null ? actorRole : "SYSTEM",
                eventType,
                "DONATION",
                donationCode != null ? donationCode : String.valueOf(donationId),
                previousStatus,
                newStatus,
                sanitizeText(description),
                corrId
        );
        auditLogRepository.save(audit);

        log.info("Recorded donation event {} for donation {} by actor {} ({}) [corrId={}]",
                eventType, donationCode, actorEmail, actorRole, corrId);

        return savedEvent;
    }

    public DeliveryHistoryEvent recordDeliveryEvent(
            Long deliveryId,
            String deliveryCode,
            Long donationId,
            String donationCode,
            Long volunteerId,
            Long ngoId,
            Long actorId,
            String actorEmail,
            String actorRole,
            String eventType,
            String previousStatus,
            String newStatus,
            String description,
            String correlationId) {

        String corrId = (correlationId != null && !correlationId.trim().isEmpty())
                ? correlationId.trim()
                : UUID.randomUUID().toString();

        DeliveryHistoryEvent event = new DeliveryHistoryEvent(
                deliveryId,
                deliveryCode,
                donationId,
                donationCode,
                volunteerId,
                ngoId,
                actorId,
                actorEmail,
                actorRole,
                eventType,
                previousStatus,
                newStatus,
                sanitizeText(description),
                corrId
        );

        DeliveryHistoryEvent savedEvent = deliveryEventRepository.save(event);

        // Also record an audit log entry for this milestone
        AuditLog audit = new AuditLog(
                actorId,
                actorEmail != null ? actorEmail : "system@foodbridge.org",
                actorRole != null ? actorRole : "SYSTEM",
                eventType,
                "DELIVERY",
                deliveryCode != null ? deliveryCode : String.valueOf(deliveryId),
                previousStatus,
                newStatus,
                sanitizeText(description),
                corrId
        );
        auditLogRepository.save(audit);

        log.info("Recorded delivery milestone {} for delivery {} by actor {} ({}) [corrId={}]",
                eventType, deliveryCode, actorEmail, actorRole, corrId);

        return savedEvent;
    }

    public AuditLog recordAuditEvent(
            Long actorId,
            String actorEmail,
            String actorRole,
            String action,
            String entityType,
            String entityId,
            String previousState,
            String newState,
            String reason,
            String correlationId) {

        String corrId = (correlationId != null && !correlationId.trim().isEmpty())
                ? correlationId.trim()
                : UUID.randomUUID().toString();

        AuditLog audit = new AuditLog(
                actorId,
                actorEmail != null ? actorEmail : "system@foodbridge.org",
                actorRole != null ? actorRole : "SYSTEM",
                action,
                entityType,
                entityId,
                previousState,
                newState,
                sanitizeText(reason),
                corrId
        );
        return auditLogRepository.save(audit);
    }

    // ==========================================
    // 2. QUERY DONATION HISTORY (Role Scoped)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<DonationHistoryEventDto> getDonationHistory(
            User currentUser,
            Long donationId,
            String donationCode,
            String eventType,
            String status,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        Long donorIdFilter = null;
        Long ngoIdFilter = null;

        if (currentUser.getRole() == Role.DONOR) {
            donorIdFilter = currentUser.getId();
        } else if (currentUser.getRole() == Role.NGO) {
            ngoIdFilter = currentUser.getId();
        } else if (currentUser.getRole() == Role.ADMIN) {
            // Admin has system-wide view; no forced scoping
        } else {
            throw new AccessDeniedException("Volunteers do not have permission to view donation lifecycle history.");
        }

        return donationEventRepository.filterDonationEvents(
                donorIdFilter,
                ngoIdFilter,
                donationId,
                donationCode,
                eventType,
                status,
                from,
                to,
                pageable
        ).map(DonationHistoryEventDto::new);
    }

    @Transactional(readOnly = true)
    public List<DonationHistoryEventDto> getDonationTimeline(User currentUser, Long donationId) {
        // Enforce ownership: If DONOR or NGO, verify ownership on the DonationRecord
        Optional<DonationRecord> donOpt = donationRecordRepository.findById(donationId);
        if (donOpt.isPresent()) {
            DonationRecord don = donOpt.get();
            if (currentUser.getRole() == Role.DONOR && !currentUser.getId().equals(don.getDonorId())) {
                throw new AccessDeniedException("FORBIDDEN: You can only view timeline history for your own donations.");
            }
            if (currentUser.getRole() == Role.NGO && !currentUser.getId().equals(don.getMatchedNgoId())) {
                throw new AccessDeniedException("FORBIDDEN: You can only view timeline history for donations matched to your NGO.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            // If record not in DonationRecord, check if any events exist with user's ID
            List<DonationHistoryEvent> events = donationEventRepository.findByDonationIdOrderByCreatedAtDescIdDesc(donationId);
            boolean authorized = events.stream().anyMatch(e ->
                    (currentUser.getRole() == Role.DONOR && currentUser.getId().equals(e.getDonorId())) ||
                    (currentUser.getRole() == Role.NGO && currentUser.getId().equals(e.getMatchedNgoId()))
            );
            if (!authorized && !events.isEmpty()) {
                throw new AccessDeniedException("FORBIDDEN: You are not authorized to view this donation timeline.");
            }
        }

        return donationEventRepository.findByDonationIdOrderByCreatedAtDescIdDesc(donationId)
                .stream()
                .map(DonationHistoryEventDto::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 3. QUERY DELIVERY HISTORY (Role Scoped)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<DeliveryHistoryEventDto> getDeliveryHistory(
            User currentUser,
            Long deliveryId,
            String deliveryCode,
            Long donationId,
            String eventType,
            String status,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        Long volunteerIdFilter = null;
        Long ngoIdFilter = null;

        if (currentUser.getRole() == Role.VOLUNTEER) {
            volunteerIdFilter = currentUser.getId();
        } else if (currentUser.getRole() == Role.NGO) {
            ngoIdFilter = currentUser.getId();
        } else if (currentUser.getRole() == Role.ADMIN) {
            // Admin has system-wide view; no forced scoping
        } else {
            throw new AccessDeniedException("Donors do not have permission to view volunteer delivery history.");
        }

        return deliveryEventRepository.filterDeliveryEvents(
                volunteerIdFilter,
                ngoIdFilter,
                deliveryId,
                deliveryCode,
                donationId,
                eventType,
                status,
                from,
                to,
                pageable
        ).map(DeliveryHistoryEventDto::new);
    }

    @Transactional(readOnly = true)
    public List<DeliveryHistoryEventDto> getDeliveryTimeline(User currentUser, Long deliveryId) {
        Optional<DeliveryRecord> delOpt = deliveryRecordRepository.findById(deliveryId);
        if (delOpt.isPresent()) {
            DeliveryRecord del = delOpt.get();
            if (currentUser.getRole() == Role.VOLUNTEER && !currentUser.getId().equals(del.getVolunteerId())) {
                throw new AccessDeniedException("FORBIDDEN: You can only view delivery milestones for tasks assigned to you.");
            }
        } else if (currentUser.getRole() != Role.ADMIN) {
            List<DeliveryHistoryEvent> events = deliveryEventRepository.findByDeliveryIdOrderByCreatedAtDescIdDesc(deliveryId);
            boolean authorized = events.stream().anyMatch(e ->
                    (currentUser.getRole() == Role.VOLUNTEER && currentUser.getId().equals(e.getVolunteerId())) ||
                    (currentUser.getRole() == Role.NGO && currentUser.getId().equals(e.getNgoId()))
            );
            if (!authorized && !events.isEmpty()) {
                throw new AccessDeniedException("FORBIDDEN: You are not authorized to view this delivery timeline.");
            }
        }

        return deliveryEventRepository.findByDeliveryIdOrderByCreatedAtDescIdDesc(deliveryId)
                .stream()
                .map(DeliveryHistoryEventDto::new)
                .collect(Collectors.toList());
    }

    // ==========================================
    // 4. ADMIN AUDIT TRAIL (Admin Only)
    // ==========================================

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAdminAuditTrail(
            String entityType,
            String action,
            String actorRole,
            String search,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        return auditLogRepository.filterAuditLogs(
                entityType,
                action,
                actorRole,
                search,
                from,
                to,
                pageable
        ).map(AuditLogDto::new);
    }

    private String sanitizeText(String input) {
        if (input == null) return null;
        // Strip out any potentially sensitive or dangerous script tags
        String sanitized = input.replaceAll("(?i)<script.*?>.*?</script.*?>", "")
                                .replaceAll("[\r\n]+", " ")
                                .trim();
        return sanitized.length() > 1000 ? sanitized.substring(0, 1000) : sanitized;
    }
}
