package com.foodbridge.backend;

import com.foodbridge.backend.admin.entity.AuditLog;
import com.foodbridge.backend.admin.repository.AuditLogRepository;
import com.foodbridge.backend.history.entity.DeliveryHistoryEvent;
import com.foodbridge.backend.history.entity.DonationHistoryEvent;
import com.foodbridge.backend.history.repository.DeliveryHistoryEventRepository;
import com.foodbridge.backend.history.repository.DonationHistoryEventRepository;
import com.foodbridge.backend.history.service.HistoryService;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class HistoryServiceAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HistoryService historyService;

    @Autowired
    private DonationHistoryEventRepository donationHistoryEventRepository;

    @Autowired
    private DeliveryHistoryEventRepository deliveryHistoryEventRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User donorUser;
    private User ngoUser;
    private User volunteerUser;

    private String adminToken;
    private String donorToken;
    private String ngoToken;
    private String volunteerToken;

    @BeforeEach
    public void setup() {
        adminUser = userRepository.findByEmail("admin@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Admin", "admin@foodbridge.org", "admin123", Role.ADMIN, "+111")));

        donorUser = userRepository.findByEmail("donor@foodbridge.org")
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

    @Test
    public void testRecordDonationEvent_SuccessAndAuditCreation() {
        String corrId = UUID.randomUUID().toString();
        DonationHistoryEvent event = historyService.recordDonationEvent(
                999L, "DON-TEST-999", donorUser.getId(), ngoUser.getId(),
                donorUser.getId(), donorUser.getEmail(), "DONOR",
                "DONATION_CREATED", null, "AVAILABLE",
                "Test donation creation event", corrId
        );

        assertNotNull(event.getId());
        assertEquals("DON-TEST-999", event.getDonationCode());
        assertEquals("AVAILABLE", event.getNewStatus());
        assertEquals(corrId, event.getCorrelationId());

        // Verify that AuditLog was also written transactionally
        List<AuditLog> auditLogs = auditLogRepository.findAll();
        boolean auditFound = auditLogs.stream().anyMatch(a ->
                "DONATION_CREATED".equals(a.getAction()) &&
                "DON-TEST-999".equals(a.getEntityId()) &&
                corrId.equals(a.getCorrelationId())
        );
        assertTrue(auditFound, "Transactional AuditLog must be generated alongside donation history event");
    }

    @Test
    public void testRecordDeliveryEvent_Success() {
        String corrId = UUID.randomUUID().toString();
        DeliveryHistoryEvent event = historyService.recordDeliveryEvent(
                888L, "DEL-TEST-888", 999L, "DON-TEST-999",
                volunteerUser.getId(), ngoUser.getId(), volunteerUser.getId(),
                volunteerUser.getEmail(), "VOLUNTEER",
                "PICKUP_COMPLETED", "PICKUP_PENDING", "PICKED_UP",
                "Test food collected successfully", corrId
        );

        assertNotNull(event.getId());
        assertEquals("DEL-TEST-888", event.getDeliveryCode());
        assertEquals("PICKED_UP", event.getNewStatus());
        assertEquals("PICKUP_PENDING", event.getPreviousStatus());
    }

    @Test
    public void testDonationHistoryScoping_DonorCanAccessOwn() throws Exception {
        mockMvc.perform(get("/api/history/donations")
                .header("Authorization", "Bearer " + donorToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    public void testDonationHistory_VolunteersForbidden() throws Exception {
        mockMvc.perform(get("/api/history/donations")
                .header("Authorization", "Bearer " + volunteerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDeliveryHistory_VolunteerCanAccessOwn() throws Exception {
        mockMvc.perform(get("/api/history/deliveries")
                .header("Authorization", "Bearer " + volunteerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    public void testDeliveryHistory_DonorsForbidden() throws Exception {
        mockMvc.perform(get("/api/history/deliveries")
                .header("Authorization", "Bearer " + donorToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminAuditTrail_AdminAuthorized() throws Exception {
        mockMvc.perform(get("/api/history/admin/audit-trail")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    public void testAdminAuditTrail_NonAdminForbidden() throws Exception {
        mockMvc.perform(get("/api/history/admin/audit-trail")
                .header("Authorization", "Bearer " + donorToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testTamperResistance_DeleteAndPutDenyAll() throws Exception {
        // Attempting to DELETE history record must fail
        mockMvc.perform(delete("/api/history/donations/1")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());

        // Attempting to PUT / modify history record must fail
        mockMvc.perform(put("/api/history/donations/1")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\": \"tampered\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testCorrelationIdHeader_PropagatedInResponse() throws Exception {
        String testCorrId = "trace-test-" + System.currentTimeMillis();

        mockMvc.perform(get("/api/history/donations")
                .header("Authorization", "Bearer " + donorToken)
                .header("X-Correlation-ID", testCorrId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Correlation-ID", testCorrId));
    }
}
