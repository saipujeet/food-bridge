package com.foodbridge.backend;

import com.foodbridge.backend.analytics.dto.*;
import com.foodbridge.backend.analytics.service.AnalyticsService;
import com.foodbridge.backend.security.JwtTokenProvider;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AnalyticsServiceAndSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String adminToken;
    private String donorToken;
    private String ngoToken;
    private String volunteerToken;
    private User adminUser;
    private User donorUser;
    private User ngoUser;
    private User volunteerUser;

    @BeforeEach
    public void setup() {
        adminUser = userRepository.findByEmail("admin@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Admin", "admin@foodbridge.org", "admin123", Role.ADMIN, "+111")));

        donorUser = userRepository.findByEmail("donor@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Donor", "donor@foodbridge.org", "donor123", Role.DONOR, "+222")));

        ngoUser = userRepository.findByEmail("ngo@foodbridge.org")
                .orElseGet(() -> {
                    User ngo = new User("NGO", "ngo@foodbridge.org", "ngo123", Role.NGO, "+333");
                    ngo.setMaxCapacity(200);
                    return userRepository.save(ngo);
                });

        volunteerUser = userRepository.findByEmail("volunteer@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Volunteer", "volunteer@foodbridge.org", "vol123", Role.VOLUNTEER, "+444")));

        adminToken = jwtTokenProvider.generateToken(adminUser.getId(), adminUser.getEmail(), "ADMIN", adminUser.getName());
        donorToken = jwtTokenProvider.generateToken(donorUser.getId(), donorUser.getEmail(), "DONOR", donorUser.getName());
        ngoToken = jwtTokenProvider.generateToken(ngoUser.getId(), ngoUser.getEmail(), "NGO", ngoUser.getName());
        volunteerToken = jwtTokenProvider.generateToken(volunteerUser.getId(), volunteerUser.getEmail(), "VOLUNTEER", volunteerUser.getName());
    }

    @Test
    public void testAdminOverviewAllowedForAdmin() throws Exception {
        mockMvc.perform(get("/api/analytics/admin/overview")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalNGOs").isNumber());
    }

    @Test
    public void testAdminOverviewForbiddenForDonorAndNgo() throws Exception {
        mockMvc.perform(get("/api/analytics/admin/overview")
                .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/analytics/admin/overview")
                .header("Authorization", "Bearer " + ngoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testAdminOverviewUnauthorizedForAnonymous() throws Exception {
        mockMvc.perform(get("/api/analytics/admin/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void testNGOOverviewAllowedForNgo() throws Exception {
        mockMvc.perform(get("/api/analytics/ngo/overview")
                .header("Authorization", "Bearer " + ngoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.remainingCapacityKg").isNumber());
    }

    @Test
    public void testNGOOverviewForbiddenForVolunteer() throws Exception {
        mockMvc.perform(get("/api/analytics/ngo/overview")
                .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void testDonorOverviewAllowedForDonor() throws Exception {
        mockMvc.perform(get("/api/analytics/donor/overview")
                .header("Authorization", "Bearer " + donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalFoodOfferedKg").isNumber());
    }

    @Test
    public void testVolunteerOverviewAllowedForVolunteer() throws Exception {
        mockMvc.perform(get("/api/analytics/volunteer/overview")
                .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assignedDeliveries").isNumber());
    }

    @Test
    public void testNgoCapacityFormula() {
        NGOOverviewDto dto = analyticsService.getNGOOverview(ngoUser.getId());
        assertNotNull(dto);
        assertTrue(dto.getDailyCapacityKg() > 0);
        assertEquals(
                Math.max(0.0, dto.getDailyCapacityKg() - dto.getFoodReceivedTodayKg()),
                dto.getRemainingCapacityKg(),
                0.01,
                "Remaining capacity must equal max(0, daily capacity - food received today)"
        );
    }

    @Test
    public void testDonorOfferedVsDistributedDistinction() {
        DonorOverviewDto dto = analyticsService.getDonorOverview(donorUser.getId());
        assertNotNull(dto);
        assertTrue(dto.getTotalFoodOfferedKg() >= 0);
        assertTrue(dto.getTotalFoodDistributedKg() >= 0);
        assertTrue(dto.getTotalFoodDistributedKg() <= dto.getTotalFoodOfferedKg(),
                "Distributed food must be less than or equal to offered food");
    }

    @Test
    public void testAdminTrendsGeneration() {
        List<TrendPointDto> weekTrends = analyticsService.getAdminTrends("week");
        assertEquals(7, weekTrends.size(), "Week trends must contain 7 daily data points");

        List<TrendPointDto> monthTrends = analyticsService.getAdminTrends("month");
        assertEquals(30, monthTrends.size(), "Month trends must contain 30 daily data points");
    }
}
