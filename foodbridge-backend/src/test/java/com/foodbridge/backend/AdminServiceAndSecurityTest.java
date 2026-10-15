package com.foodbridge.backend;

import com.foodbridge.backend.admin.dto.AdminDashboardSummaryDto;
import com.foodbridge.backend.admin.entity.AuditLog;
import com.foodbridge.backend.admin.entity.SystemSetting;
import com.foodbridge.backend.admin.repository.AuditLogRepository;
import com.foodbridge.backend.admin.service.AdminService;
import com.foodbridge.backend.auth.dto.UserDto;
import com.foodbridge.backend.security.JwtTokenProvider;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AdminServiceAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String adminToken;
    private String donorToken;
    private String ngoToken;
    private String volunteerToken;
    private User adminUser;
    private User ngoUser;
    private User volunteerUser;

    @BeforeEach
    public void setup() {
        adminUser = userRepository.findByEmail("admin@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Admin", "admin@foodbridge.org", "admin123", Role.ADMIN, "+111")));

        User donorUser = userRepository.findByEmail("donor@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Donor", "donor@foodbridge.org", "donor123", Role.DONOR, "+222")));

        ngoUser = userRepository.findByEmail("ngo@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("NGO", "ngo@foodbridge.org", "ngo123", Role.NGO, "+333")));

        volunteerUser = userRepository.findByEmail("volunteer@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Volunteer", "volunteer@foodbridge.org", "volunteer123", Role.VOLUNTEER, "+444")));

        adminToken = jwtTokenProvider.generateToken(adminUser.getId(), adminUser.getEmail(), "ADMIN", adminUser.getName());
        donorToken = jwtTokenProvider.generateToken(donorUser.getId(), donorUser.getEmail(), "DONOR", donorUser.getName());
        ngoToken = jwtTokenProvider.generateToken(ngoUser.getId(), ngoUser.getEmail(), "NGO", ngoUser.getName());
        volunteerToken = jwtTokenProvider.generateToken(volunteerUser.getId(), volunteerUser.getEmail(), "VOLUNTEER", volunteerUser.getName());
    }

    // 1. Admin can access authorized administrative endpoints
    @Test
    public void testAdminCanAccessSummary() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").isNumber());
    }

    // 2. Donor cannot access administrative endpoints (403 Forbidden)
    @Test
    public void testDonorForbiddenOnAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary")
                .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden());
    }

    // 3. NGO cannot access administrative endpoints (403 Forbidden)
    @Test
    public void testNGOForbiddenOnAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/ngos")
                .header("Authorization", "Bearer " + ngoToken))
                .andExpect(status().isForbidden());
    }

    // 4. Volunteer cannot access administrative endpoints (403 Forbidden)
    @Test
    public void testVolunteerForbiddenOnAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/volunteers")
                .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isForbidden());
    }

    // 5. Unauthenticated requests are rejected (401 Unauthorized)
    @Test
    public void testUnauthenticatedRejected() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }

    // 6. NGO verification transitions status and logs audit
    @Test
    public void testNGOVerificationAndAudit() {
        long initialLogs = auditLogRepository.count();

        UserDto verified = adminService.verifyNgo(ngoUser.getId(), adminUser.getId(), adminUser.getEmail());
        assertEquals("VERIFIED", verified.getVerificationStatus());

        User fresh = userRepository.findById(ngoUser.getId()).orElseThrow();
        assertEquals("VERIFIED", fresh.getVerificationStatus());

        long afterLogs = auditLogRepository.count();
        assertTrue(afterLogs > initialLogs);
    }

    // 7. NGO rejection records reason and status
    @Test
    public void testNGORejectionWithReason() {
        UserDto rejected = adminService.rejectNgo(ngoUser.getId(), "Incomplete shelter health certificates", adminUser.getId(), adminUser.getEmail());
        assertEquals("REJECTED", rejected.getVerificationStatus());

        User fresh = userRepository.findById(ngoUser.getId()).orElseThrow();
        assertEquals("REJECTED", fresh.getVerificationStatus());
        assertEquals("Incomplete shelter health certificates", fresh.getVerificationReason());
    }

    // 8. Volunteer suspension records reason and status
    @Test
    public void testVolunteerSuspension() {
        UserDto suspended = adminService.suspendVolunteer(volunteerUser.getId(), "Vehicle maintenance required", adminUser.getId(), adminUser.getEmail());
        assertEquals("SUSPENDED", suspended.getVerificationStatus());
    }

    // 9. Dashboard figures come from database
    @Test
    public void testDashboardSummaryDerivedFromDatabase() {
        AdminDashboardSummaryDto summary = adminService.getDashboardSummary();
        assertNotNull(summary);
        assertTrue(summary.getTotalUsers() > 0);
        assertTrue(summary.getTotalDonations() > 0);
        assertTrue(summary.getSystemMatchingRate() > 90.0);
    }

    // 10. Self-suspension security rule prevention
    @Test
    public void testAdminCannotSuspendSelf() {
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            adminService.suspendUser(adminUser.getId(), "Testing self suspend", adminUser.getId(), adminUser.getEmail());
        });
        assertTrue(ex.getMessage().contains("cannot suspend your own"));
    }

    // 11. Invalid settings are rejected
    @Test
    public void testInvalidRadiusSettingRejected() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            adminService.updateSetting("initial_matching_radius_km", "-5", adminUser.getId(), adminUser.getEmail());
        });
        assertTrue(ex.getMessage().contains("positive number"));
    }

    // 12. Valid settings update and create audit log
    @Test
    public void testValidSettingUpdate() {
        SystemSetting updated = adminService.updateSetting("initial_matching_radius_km", "8", adminUser.getId(), adminUser.getEmail());
        assertEquals("8", updated.getSettingValue());

        List<AuditLog> logs = auditLogRepository.findByEntityType("SYSTEM_SETTING");
        assertFalse(logs.isEmpty());
    }
}
