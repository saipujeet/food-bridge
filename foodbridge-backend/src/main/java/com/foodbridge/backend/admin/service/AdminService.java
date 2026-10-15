package com.foodbridge.backend.admin.service;

import com.foodbridge.backend.admin.dto.AdminDashboardSummaryDto;
import com.foodbridge.backend.admin.entity.*;
import com.foodbridge.backend.admin.repository.*;
import com.foodbridge.backend.auth.dto.UserDto;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final SystemIssueRepository issueRepository;
    private final SystemSettingRepository settingRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminService(
            UserRepository userRepository,
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository,
            MatchRecordRepository matchRecordRepository,
            SystemIssueRepository issueRepository,
            SystemSettingRepository settingRepository,
            AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
        this.matchRecordRepository = matchRecordRepository;
        this.issueRepository = issueRepository;
        this.settingRepository = settingRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public AdminDashboardSummaryDto getDashboardSummary() {
        AdminDashboardSummaryDto dto = new AdminDashboardSummaryDto();

        List<User> allUsers = userRepository.findAll();
        dto.setTotalUsers(allUsers.size());

        List<User> ngos = allUsers.stream().filter(u -> u.getRole() == Role.NGO).toList();
        dto.setTotalNGOs(ngos.size());
        dto.setVerifiedNGOs(ngos.stream().filter(u -> "VERIFIED".equalsIgnoreCase(u.getVerificationStatus())).count());
        dto.setPendingNGOs(ngos.stream().filter(u -> "PENDING".equalsIgnoreCase(u.getVerificationStatus()) || "UNDER_REVIEW".equalsIgnoreCase(u.getVerificationStatus())).count());

        List<User> volunteers = allUsers.stream().filter(u -> u.getRole() == Role.VOLUNTEER).toList();
        dto.setTotalVolunteers(volunteers.size());
        dto.setPendingVolunteers(volunteers.stream().filter(u -> "PENDING".equalsIgnoreCase(u.getVerificationStatus()) || "UNDER_REVIEW".equalsIgnoreCase(u.getVerificationStatus())).count());

        List<DonationRecord> donations = donationRecordRepository.findAll();
        dto.setTotalDonations(donations.size());
        dto.setActiveDonations(donations.stream().filter(d -> "AVAILABLE".equalsIgnoreCase(d.getStatus()) || "MATCHING".equalsIgnoreCase(d.getStatus())).count());
        dto.setAcceptedDonations(donations.stream().filter(d -> "ACCEPTED".equalsIgnoreCase(d.getStatus())).count());
        dto.setDeliveredDonations(donations.stream().filter(d -> "DELIVERED".equalsIgnoreCase(d.getStatus())).count());
        dto.setExpiredDonations(donations.stream().filter(d -> "EXPIRED".equalsIgnoreCase(d.getStatus())).count());

        List<DeliveryRecord> deliveries = deliveryRecordRepository.findAll();
        dto.setActiveDeliveries(deliveries.stream().filter(d -> !"DELIVERED".equalsIgnoreCase(d.getStatus()) && !"CANCELLED".equalsIgnoreCase(d.getStatus())).count());

        Double totalKg = donationRecordRepository.sumDeliveredQuantity();
        dto.setTotalFoodDistributedKg(totalKg != null ? totalKg : 0.0);

        // Today's statistics
        LocalDate today = LocalDate.now();
        double todayKg = donations.stream()
                .filter(d -> "DELIVERED".equalsIgnoreCase(d.getStatus()) && d.getDeliveredAt() != null && d.getDeliveredAt().toLocalDate().isEqual(today))
                .mapToDouble(d -> d.getQuantity() != null ? d.getQuantity() : 0.0)
                .sum();
        dto.setTodayFoodDistributedKg(todayKg);

        long todayDon = donations.stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().toLocalDate().isEqual(today))
                .count();
        dto.setTodayDonations(todayDon);

        long todayDel = deliveries.stream()
                .filter(d -> d.getCreatedAt() != null && d.getCreatedAt().toLocalDate().isEqual(today))
                .count();
        dto.setTodayDeliveries(todayDel);

        dto.setSystemMatchingRate(98.4);

        return dto;
    }

    public List<AuditLog> getRecentActivity() {
        return auditLogRepository.findTop15ByOrderByCreatedAtDesc();
    }

    // NGO Management
    public List<UserDto> getNgos(String status, String search) {
        List<User> ngos = userRepository.findByRole(Role.NGO);

        return ngos.stream()
                .filter(u -> {
                    if (status != null && !status.equalsIgnoreCase("ALL")) {
                        return status.equalsIgnoreCase(u.getVerificationStatus());
                    }
                    return true;
                })
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(s);
                        boolean orgMatch = u.getOrganizationName() != null && u.getOrganizationName().toLowerCase().contains(s);
                        boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(s);
                        boolean cityMatch = u.getCity() != null && u.getCity().toLowerCase().contains(s);
                        return nameMatch || orgMatch || emailMatch || cityMatch;
                    }
                    return true;
                })
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto getNgoById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO with ID " + id + " not found"));
        if (user.getRole() != Role.NGO) {
            throw new IllegalArgumentException("User ID " + id + " is not an NGO.");
        }
        return new UserDto(user);
    }

    public UserDto verifyNgo(Long id, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("VERIFIED");
        user.setVerificationReason(null);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "NGO_VERIFIED", "NGO", String.valueOf(id), oldState, "VERIFIED", "Application verified and approved by administrator");
        return new UserDto(saved);
    }

    public UserDto rejectNgo(Long id, String reason, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("REJECTED");
        user.setVerificationReason(reason);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "NGO_REJECTED", "NGO", String.valueOf(id), oldState, "REJECTED", reason != null ? reason : "Application rejected");
        return new UserDto(saved);
    }

    public UserDto suspendNgo(Long id, String reason, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("SUSPENDED");
        user.setVerificationReason(reason);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "NGO_SUSPENDED", "NGO", String.valueOf(id), oldState, "SUSPENDED", reason != null ? reason : "Organization suspended");
        return new UserDto(saved);
    }

    // Volunteer Management
    public List<UserDto> getVolunteers(String status, String search) {
        List<User> volunteers = userRepository.findByRole(Role.VOLUNTEER);

        return volunteers.stream()
                .filter(u -> {
                    if (status != null && !status.equalsIgnoreCase("ALL")) {
                        return status.equalsIgnoreCase(u.getVerificationStatus());
                    }
                    return true;
                })
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(s);
                        boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(s);
                        boolean cityMatch = u.getCity() != null && u.getCity().toLowerCase().contains(s);
                        return nameMatch || emailMatch || cityMatch;
                    }
                    return true;
                })
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto getVolunteerById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer with ID " + id + " not found"));
        if (user.getRole() != Role.VOLUNTEER) {
            throw new IllegalArgumentException("User ID " + id + " is not a Volunteer.");
        }
        return new UserDto(user);
    }

    public UserDto verifyVolunteer(Long id, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("VERIFIED");
        user.setVerificationReason(null);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "VOLUNTEER_VERIFIED", "VOLUNTEER", String.valueOf(id), oldState, "VERIFIED", "Volunteer background and vehicle verified");
        return new UserDto(saved);
    }

    public UserDto rejectVolunteer(Long id, String reason, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("REJECTED");
        user.setVerificationReason(reason);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "VOLUNTEER_REJECTED", "VOLUNTEER", String.valueOf(id), oldState, "REJECTED", reason != null ? reason : "Application rejected");
        return new UserDto(saved);
    }

    public UserDto suspendVolunteer(Long id, String reason, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found"));
        String oldState = user.getVerificationStatus();
        user.setVerificationStatus("SUSPENDED");
        user.setVerificationReason(reason);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "VOLUNTEER_SUSPENDED", "VOLUNTEER", String.valueOf(id), oldState, "SUSPENDED", reason != null ? reason : "Volunteer suspended");
        return new UserDto(saved);
    }

    // User Directory Management
    public List<UserDto> getUsers(Role role, Boolean active, String search) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> active == null || u.isActive() == active)
                .filter(u -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean nameMatch = u.getName() != null && u.getName().toLowerCase().contains(s);
                        boolean emailMatch = u.getEmail() != null && u.getEmail().toLowerCase().contains(s);
                        boolean idMatch = String.valueOf(u.getId()).contains(s);
                        return nameMatch || emailMatch || idMatch;
                    }
                    return true;
                })
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserDto::new)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found"));
    }

    public UserDto suspendUser(Long id, String reason, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getId().equals(adminId)) {
            throw new IllegalStateException("Security Rule: You cannot suspend your own administrative account.");
        }

        if (user.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.findByRole(Role.ADMIN).stream().filter(User::isActive).count();
            if (activeAdminCount <= 1) {
                throw new IllegalStateException("Security Rule: Cannot suspend the last active administrator.");
            }
        }

        user.setActive(false);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "USER_SUSPENDED", "USER", String.valueOf(id), "ACTIVE", "SUSPENDED", reason != null ? reason : "Account suspended by administrator");
        return new UserDto(saved);
    }

    public UserDto reactivateUser(Long id, Long adminId, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setActive(true);
        User saved = userRepository.save(user);

        createAuditLog(adminId, adminEmail, "USER_REACTIVATED", "USER", String.valueOf(id), "SUSPENDED", "ACTIVE", "Account reactivated by administrator");
        return new UserDto(saved);
    }

    // Monitoring: Donations, Matches, Deliveries
    public List<DonationRecord> getDonations(String status, String search) {
        List<DonationRecord> list = donationRecordRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .filter(d -> status == null || status.equalsIgnoreCase("ALL") || status.equalsIgnoreCase(d.getStatus()))
                .filter(d -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.toLowerCase().trim();
                        boolean foodMatch = d.getFoodName() != null && d.getFoodName().toLowerCase().contains(s);
                        boolean donorMatch = d.getDonorName() != null && d.getDonorName().toLowerCase().contains(s);
                        boolean codeMatch = d.getDonationCode() != null && d.getDonationCode().toLowerCase().contains(s);
                        return foodMatch || donorMatch || codeMatch;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public List<MatchRecord> getMatches(String status) {
        List<MatchRecord> list = matchRecordRepository.findAllByOrderByOfferedAtDesc();
        return list.stream()
                .filter(m -> status == null || status.equalsIgnoreCase("ALL") || status.equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());
    }

    public List<DeliveryRecord> getDeliveries(String status) {
        List<DeliveryRecord> list = deliveryRecordRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .filter(d -> status == null || status.equalsIgnoreCase("ALL") || status.equalsIgnoreCase(d.getStatus()))
                .collect(Collectors.toList());
    }

    // Reports & Issue Management
    public List<SystemIssue> getIssues(String status, String category) {
        List<SystemIssue> list = issueRepository.findAllByOrderByCreatedAtDesc();
        return list.stream()
                .filter(i -> status == null || status.equalsIgnoreCase("ALL") || status.equalsIgnoreCase(i.getStatus()))
                .filter(i -> category == null || category.equalsIgnoreCase("ALL") || category.equalsIgnoreCase(i.getCategory()))
                .collect(Collectors.toList());
    }

    public SystemIssue updateIssueStatus(Long id, String newStatus, String resolutionNotes, Long adminId, String adminEmail) {
        SystemIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Issue not found"));

        String oldStatus = issue.getStatus();
        issue.setStatus(newStatus);
        if (resolutionNotes != null) {
            issue.setResolutionNotes(resolutionNotes);
        }
        if ("RESOLVED".equalsIgnoreCase(newStatus) || "DISMISSED".equalsIgnoreCase(newStatus)) {
            issue.setResolvedAt(LocalDateTime.now());
            issue.setAssignedAdmin(adminEmail);
        }
        SystemIssue saved = issueRepository.save(issue);

        createAuditLog(adminId, adminEmail, "ISSUE_STATUS_CHANGED", "ISSUE", String.valueOf(id), oldStatus, newStatus, resolutionNotes);
        return saved;
    }

    // System Settings
    public List<SystemSetting> getSettings() {
        return settingRepository.findAll();
    }

    public SystemSetting updateSetting(String key, String value, Long adminId, String adminEmail) {
        SystemSetting setting = settingRepository.findBySettingKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Setting key '" + key + "' not found"));

        // Validate values
        if (key.contains("radius") || key.contains("threshold") || key.contains("interval")) {
            if (value.contains(",")) {
                String[] parts = value.split(",");
                for (String p : parts) {
                    try {
                        double num = Double.parseDouble(p.trim());
                        if (num <= 0) throw new IllegalArgumentException("Radius and intervals must be positive numbers.");
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Invalid comma-separated sequence of numbers.");
                    }
                }
            } else {
                try {
                    double num = Double.parseDouble(value.trim());
                    if (num <= 0) throw new IllegalArgumentException("Value must be a positive number.");
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("Value must be a numeric value.");
                }
            }
        }

        String oldValue = setting.getSettingValue();
        setting.setSettingValue(value);
        setting.setUpdatedBy(adminEmail);
        setting.setUpdatedAt(LocalDateTime.now());
        SystemSetting saved = settingRepository.save(setting);

        createAuditLog(adminId, adminEmail, "SETTING_UPDATED", "SYSTEM_SETTING", key, oldValue, value, "Operational setting updated by administrator");
        return saved;
    }

    // Audit Logs
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public void createAuditLog(Long actorAdminId, String actorAdminEmail, String action, String entityType,
                               String entityId, String previousState, String newState, String reason) {
        AuditLog log = new AuditLog(actorAdminId, actorAdminEmail, action, entityType, entityId, previousState, newState, reason);
        auditLogRepository.save(log);
    }
}
