package com.foodbridge.backend;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class DonationAndDeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRecordRepository donationRecordRepository;

    @Autowired
    private DeliveryRecordRepository deliveryRecordRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String donorToken;
    private String ngoToken;
    private String volunteerToken;
    private User donorUser;
    private User ngoUser;
    private User volunteerUser;

    @BeforeEach
    public void setup() {
        donorUser = userRepository.findByEmail("donor@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Marcus Vance", "donor@foodbridge.org", "donor123", Role.DONOR, "+919848012345")));
        ngoUser = userRepository.findByEmail("ngo@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("Sarah Jenkins", "ngo@foodbridge.org", "ngo123", Role.NGO, "+919848088888")));
        volunteerUser = userRepository.findByEmail("volunteer@foodbridge.org")
                .orElseGet(() -> userRepository.save(new User("David Miller", "volunteer@foodbridge.org", "volunteer123", Role.VOLUNTEER, "+919848077777")));

        donorToken = "Bearer " + jwtTokenProvider.generateToken(donorUser.getId(), donorUser.getEmail(), "DONOR", donorUser.getName());
        ngoToken = "Bearer " + jwtTokenProvider.generateToken(ngoUser.getId(), ngoUser.getEmail(), "NGO", ngoUser.getName());
        volunteerToken = "Bearer " + jwtTokenProvider.generateToken(volunteerUser.getId(), volunteerUser.getEmail(), "VOLUNTEER", volunteerUser.getName());
    }

    @Test
    public void testUserRegistration_Success() throws Exception {
        String json = """
            {
              "name": "New Test Donor",
              "email": "newdonor@example.org",
              "password": "Password123!",
              "role": "DONOR",
              "phone": "+91 99999 11111",
              "city": "Ongole",
              "address": "Sample Street 5"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.email").value("newdonor@example.org"))
                .andExpect(jsonPath("$.data.user.isVerified").value(true));

        assertTrue(userRepository.findByEmail("newdonor@example.org").isPresent());
    }

    @Test
    public void testUserRegistration_RejectAdminSelfRegistration() throws Exception {
        String json = """
            {
              "name": "Malicious Admin Claim",
              "email": "hacker@example.org",
              "password": "Password123!",
              "role": "ADMIN"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("Administrative accounts cannot be self-registered")));
    }

    @Test
    public void testUserRegistration_DuplicateEmailRejected() throws Exception {
        String json = """
            {
              "name": "Duplicate Donor",
              "email": "donor@foodbridge.org",
              "password": "Password123!",
              "role": "DONOR"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    public void testUserProfile_GetAndPut() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("donor@foodbridge.org"));

        String updateJson = """
            {
              "organizationName": "Grand Metro Buffet",
              "city": "Vijayawada"
            }
            """;

        mockMvc.perform(put("/api/users/me")
                        .header("Authorization", donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.organizationName").value("Grand Metro Buffet"))
                .andExpect(jsonPath("$.data.city").value("Vijayawada"));
    }

    @Test
    public void testCreateDonation_Success() throws Exception {
        String json = """
            {
              "foodName": "Fresh Dal and Rice Containers",
              "foodCategory": "Cooked Meals",
              "foodType": "Vegetarian",
              "quantity": 35.0,
              "unit": "kg",
              "description": "Hot hygienic lunch meals from corporate caterer.",
              "donorCity": "Ongole",
              "latitude": 15.505,
              "longitude": 80.049
            }
            """;

        mockMvc.perform(post("/api/donations")
                        .header("Authorization", donorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.foodName").value("Fresh Dal and Rice Containers"))
                .andExpect(jsonPath("$.data.quantity").value(35.0))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));
    }

    @Test
    public void testGetDonorDonations() throws Exception {
        DonationRecord don = new DonationRecord(
                "DON-TEST-MY", donorUser.getId(), "Marcus Vance", "Ongole", "Addr",
                "Dal Fry", "Cooked Meals", 15.0, "kg", "AVAILABLE",
                java.time.LocalDateTime.now().plusHours(10), 5.0, "STAGE_1_5KM"
        );
        donationRecordRepository.save(don);

        mockMvc.perform(get("/api/donations/my")
                        .header("Authorization", donorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    public void testDonationClaimAndDeliveryGeneration() throws Exception {
        // Create fresh donation
        DonationRecord don = new DonationRecord(
                "DON-TEST-CLAIM", donorUser.getId(), "Test Donor", "Ongole", "Addr",
                "Warm Curd Rice", "Cooked Meals", 25.0, "kg", "AVAILABLE",
                java.time.LocalDateTime.now().plusHours(10), 5.0, "STAGE_1_5KM"
        );
        donationRecordRepository.save(don);

        // NGO claims donation
        mockMvc.perform(post("/api/donations/DON-TEST-CLAIM/claim")
                        .header("Authorization", ngoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.data.matchedNgoName").value(ngoUser.getOrganizationName()));

        // Verify linked delivery record was created
        assertTrue(deliveryRecordRepository.findAll().stream()
                .anyMatch(d -> "DON-TEST-CLAIM".equals(d.getDonationCode())));
    }

    @Test
    public void testDeliveryLifecycle_AcceptPickupTransitComplete() throws Exception {
        // Create delivery task in PENDING_ASSIGNMENT
        DeliveryRecord del = new DeliveryRecord(
                "DEL-LIFECYCLE-TEST", 999L, "DON-TEST-999", "Grand Hyatt Canteen", "742 Evergreen Terrace",
                "Hope Harvest Foundation", "108 Compassion Ave", null, null, "PENDING_ASSIGNMENT"
        );
        deliveryRecordRepository.save(del);

        // 1. Volunteer accepts delivery
        mockMvc.perform(post("/api/deliveries/DEL-LIFECYCLE-TEST/accept")
                        .header("Authorization", volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.data.volunteerName").value(volunteerUser.getName()));

        // 2. Pickup confirmation
        mockMvc.perform(post("/api/deliveries/DEL-LIFECYCLE-TEST/pickup")
                        .header("Authorization", volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PICKED_UP"));

        // 3. Start transit
        mockMvc.perform(post("/api/deliveries/DEL-LIFECYCLE-TEST/start")
                        .header("Authorization", volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("IN_TRANSIT"));

        // 4. Complete delivery
        mockMvc.perform(post("/api/deliveries/DEL-LIFECYCLE-TEST/complete")
                        .header("Authorization", volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DELIVERED"));

        // 5. Check 3-point map payload
        mockMvc.perform(get("/api/deliveries/DEL-LIFECYCLE-TEST/map")
                        .header("Authorization", volunteerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DELIVERED"))
                .andExpect(jsonPath("$.data.donorLocation.address").value("742 Evergreen Terrace"))
                .andExpect(jsonPath("$.data.ngoLocation.address").value("108 Compassion Ave"));
    }
}
