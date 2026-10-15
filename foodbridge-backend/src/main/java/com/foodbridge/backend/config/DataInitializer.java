package com.foodbridge.backend.config;

import com.foodbridge.backend.admin.entity.*;
import com.foodbridge.backend.admin.repository.*;
import com.foodbridge.backend.notification.service.NotificationService;
import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final SystemSettingRepository settingRepository;
    private final SystemIssueRepository issueRepository;
    private final AuditLogRepository auditLogRepository;
    private final com.foodbridge.backend.history.repository.DonationHistoryEventRepository donationHistoryEventRepository;
    private final com.foodbridge.backend.history.repository.DeliveryHistoryEventRepository deliveryHistoryEventRepository;

    public DataInitializer(
            UserRepository userRepository,
            NotificationService notificationService,
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository,
            MatchRecordRepository matchRecordRepository,
            SystemSettingRepository settingRepository,
            SystemIssueRepository issueRepository,
            AuditLogRepository auditLogRepository,
            com.foodbridge.backend.history.repository.DonationHistoryEventRepository donationHistoryEventRepository,
            com.foodbridge.backend.history.repository.DeliveryHistoryEventRepository deliveryHistoryEventRepository) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
        this.matchRecordRepository = matchRecordRepository;
        this.settingRepository = settingRepository;
        this.issueRepository = issueRepository;
        this.auditLogRepository = auditLogRepository;
        this.donationHistoryEventRepository = donationHistoryEventRepository;
        this.deliveryHistoryEventRepository = deliveryHistoryEventRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Seeding initial FoodBridge users (Donor, NGO, Volunteer, Admin)...");

            User admin = new User(
                    "System Administrator",
                    "admin@foodbridge.org",
                    "admin123",
                    Role.ADMIN,
                    "+1555019286",
                    "FoodBridge Governance Board",
                    "Central Operations Center",
                    "Ongole",
                    "VERIFIED"
            );
            userRepository.save(admin);

            User donor1 = new User(
                    "Chef Marcus Vance",
                    "donor@foodbridge.org",
                    "donor123",
                    Role.DONOR,
                    "+1555019283",
                    "Grand Hyatt Metro Canteen",
                    "742 Evergreen Terrace",
                    "Ongole",
                    "VERIFIED"
            );
            userRepository.save(donor1);

            User ngo1 = new User(
                    "Sarah Jenkins",
                    "ngo@foodbridge.org",
                    "ngo123",
                    Role.NGO,
                    "+1555019284",
                    "Hope Harvest Foundation",
                    "108 Compassion Ave",
                    "Ongole",
                    "VERIFIED"
            );
            ngo1.setMaxCapacity(250);
            ngo1.setAvailableCapacity(205);
            userRepository.save(ngo1);

            User ngo2 = new User(
                    "Priya Sharma",
                    "helping@foodbridge.org",
                    "ngo123",
                    Role.NGO,
                    "+1555019288",
                    "Helping Hands Shelter",
                    "54 Shelter Road",
                    "Vijayawada",
                    "PENDING"
            );
            ngo2.setMaxCapacity(150);
            ngo2.setAvailableCapacity(150);
            userRepository.save(ngo2);

            User vol1 = new User(
                    "David Miller",
                    "volunteer@foodbridge.org",
                    "volunteer123",
                    Role.VOLUNTEER,
                    "+1555019285",
                    null,
                    "Central District",
                    "Ongole",
                    "VERIFIED"
            );
            vol1.setVehicleType("Motorcycle / Scooter");
            userRepository.save(vol1);

            User vol2 = new User(
                    "Alex Rivera",
                    "alex@foodbridge.org",
                    "volunteer123",
                    Role.VOLUNTEER,
                    "+1555019289",
                    null,
                    "North Suburbs",
                    "Vijayawada",
                    "PENDING"
            );
            vol2.setVehicleType("Electric Cargo Van");
            userRepository.save(vol2);

            log.info("Users seeded successfully.");
        }

        if (settingRepository.count() == 0) {
            log.info("Seeding initial System Settings...");
            settingRepository.save(new SystemSetting("initial_matching_radius_km", "5", "Initial search radius for new food donations", "Matching Engine", "admin@foodbridge.org"));
            settingRepository.save(new SystemSetting("radius_expansion_stages_km", "5,10,15,20", "Ordered sequence of radius expansion stages in kilometers", "Matching Engine", "admin@foodbridge.org"));
            settingRepository.save(new SystemSetting("radius_expansion_interval_mins", "30", "Interval between successive radius expansion evaluations", "Matching Engine", "admin@foodbridge.org"));
            settingRepository.save(new SystemSetting("max_matching_radius_km", "20", "Maximum ceiling distance for matching surplus food", "Matching Engine", "admin@foodbridge.org"));
            settingRepository.save(new SystemSetting("delivery_delay_threshold_mins", "45", "Time after pickup before delivery is flagged as delayed", "Delivery Tracking", "admin@foodbridge.org"));
            settingRepository.save(new SystemSetting("auto_expiration_check_enabled", "true", "Automatically transition past availableUntil donations to EXPIRED", "Safety Rules", "admin@foodbridge.org"));
        }

        if (donationRecordRepository.count() == 0) {
            log.info("Seeding initial Donation Records for monitoring...");
            DonationRecord d1 = new DonationRecord(
                    "DON-1001", 1L, "Grand Hyatt Metro Canteen", "Ongole", "742 Evergreen Terrace",
                    "Fresh Vegetable Biryani & Gravy Meals", "Biryani", 45.0, "kg", "MATCHING",
                    LocalDateTime.now().plusHours(12), 5.0, "STAGE_1_5KM"
            );
            donationRecordRepository.save(d1);

            DonationRecord d2 = new DonationRecord(
                    "DON-1002", 1L, "Grand Hyatt Metro Canteen", "Ongole", "742 Evergreen Terrace",
                    "Artisan Bread Rolls & Whole Wheat Buns", "Bakery", 20.0, "boxes", "ACCEPTED",
                    LocalDateTime.now().plusHours(8), 10.0, "ACCEPTED"
            );
            d2.setMatchedNgoId(2L);
            d2.setMatchedNgoName("Hope Harvest Foundation");
            donationRecordRepository.save(d2);

            DonationRecord d3 = new DonationRecord(
                    "DON-1003", 1L, "Grand Hyatt Metro Canteen", "Ongole", "742 Evergreen Terrace",
                    "Sealed Fruit Juice Packs & Mixed Snacks", "Packaged Food", 85.0, "packets", "DELIVERED",
                    LocalDateTime.now().minusHours(2), 5.0, "COMPLETED"
            );
            d3.setMatchedNgoId(2L);
            d3.setMatchedNgoName("Hope Harvest Foundation");
            d3.setAssignedVolunteerId(3L);
            d3.setAssignedVolunteerName("David Miller");
            d3.setDeliveredAt(LocalDateTime.now().minusHours(1));
            donationRecordRepository.save(d3);

            DonationRecord d4 = new DonationRecord(
                    "DON-1004", 1L, "Grand Hyatt Metro Canteen", "Ongole", "742 Evergreen Terrace",
                    "Prepared Mixed Vegetable Pulao", "Cooked Meals", 30.0, "kg", "EXPIRED",
                    LocalDateTime.now().minusHours(4), 20.0, "EXPIRED"
            );
            donationRecordRepository.save(d4);
        }

        if (deliveryRecordRepository.count() == 0) {
            log.info("Seeding initial Delivery Records...");
            DeliveryRecord del1 = new DeliveryRecord(
                    "DEL-101", 2L, "DON-1002", "Grand Hyatt Metro Canteen", "742 Evergreen Terrace, Ongole",
                    "Hope Harvest Foundation", "108 Compassion Ave, Ongole",
                    3L, "David Miller", "IN_TRANSIT"
            );
            del1.setAssignedAt(LocalDateTime.now().minusMinutes(40));
            del1.setPickedUpAt(LocalDateTime.now().minusMinutes(20));
            del1.setLastVolunteerLat(15.503);
            del1.setLastVolunteerLng(80.051);
            deliveryRecordRepository.save(del1);

            DeliveryRecord del2 = new DeliveryRecord(
                    "DEL-102", 3L, "DON-1003", "Grand Hyatt Metro Canteen", "742 Evergreen Terrace, Ongole",
                    "Hope Harvest Foundation", "108 Compassion Ave, Ongole",
                    3L, "David Miller", "DELIVERED"
            );
            del2.setAssignedAt(LocalDateTime.now().minusHours(3));
            del2.setPickedUpAt(LocalDateTime.now().minusHours(2));
            del2.setDeliveredAt(LocalDateTime.now().minusHours(1));
            del2.setLastVolunteerLat(15.5006);
            del2.setLastVolunteerLng(80.0532);
            deliveryRecordRepository.save(del2);
        }

        if (matchRecordRepository.count() == 0) {
            log.info("Seeding initial Match Records...");
            matchRecordRepository.save(new MatchRecord(1L, "DON-1001", 2L, "Hope Harvest Foundation", 2.3, 5.0, "OFFERED"));
            matchRecordRepository.save(new MatchRecord(2L, "DON-1002", 2L, "Hope Harvest Foundation", 2.3, 5.0, "ACCEPTED"));
        }

        if (issueRepository.count() == 0) {
            log.info("Seeding initial System Issues...");
            issueRepository.save(new SystemIssue("DONATION_COMPLAINT", "Late pickup inquiry for DON-1004", "Donor inquired why surplus vegetable pulao was not claimed before expiration window.", "DONATION", "DON-1004", "donor@foodbridge.org"));
            issueRepository.save(new SystemIssue("NGO_VERIFICATION", "Verify NGO registration document", "Helping Hands Shelter submitted annual 80G tax exemption certificates.", "NGO", "usr_ngo_2", "helping@foodbridge.org"));
            issueRepository.save(new SystemIssue("FAILED_DELIVERY", "Traffic delay notification", "Volunteer reported road construction on Compassion Ave causing 15m delay.", "DELIVERY", "DEL-101", "volunteer@foodbridge.org"));
        }

        if (auditLogRepository.count() == 0) {
            log.info("Seeding initial Audit Logs...");
            auditLogRepository.save(new AuditLog(1L, "admin@foodbridge.org", "ADMIN", "PLATFORM_INITIALIZATION", "SYSTEM", "SYS-01", null, "ACTIVE", "FoodBridge platform service initialized", java.util.UUID.randomUUID().toString()));
            auditLogRepository.save(new AuditLog(1L, "admin@foodbridge.org", "ADMIN", "NGO_VERIFIED", "NGO", "2", "PENDING", "VERIFIED", "Hope Harvest Foundation verification confirmed", java.util.UUID.randomUUID().toString()));
            auditLogRepository.save(new AuditLog(1L, "admin@foodbridge.org", "ADMIN", "VOLUNTEER_VERIFIED", "VOLUNTEER", "3", "PENDING", "VERIFIED", "David Miller volunteer credentials approved", java.util.UUID.randomUUID().toString()));
        }

        if (donationHistoryEventRepository.count() == 0) {
            log.info("Seeding initial authentic Donation History Events...");
            // DON-1001 (Available / Matching)
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    1L, "DON-1001", 1L, null, 1L, "donor@foodbridge.org", "DONOR",
                    "DONATION_CREATED", null, "AVAILABLE", "Donation batch created by Grand Hyatt Metro Canteen (45 kg)",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    1L, "DON-1001", 1L, null, null, "system@foodbridge.org", "SYSTEM",
                    "MATCH_SEARCH_INITIATED", "AVAILABLE", "MATCHING", "Matching Engine initiated search within 5 km radius",
                    java.util.UUID.randomUUID().toString()
            ));

            // DON-1002 (Accepted)
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    2L, "DON-1002", 1L, null, 1L, "donor@foodbridge.org", "DONOR",
                    "DONATION_CREATED", null, "AVAILABLE", "Donation batch created by Grand Hyatt Metro Canteen (20 boxes)",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    2L, "DON-1002", 1L, 2L, 2L, "ngo@foodbridge.org", "NGO",
                    "NGO_ACCEPTED", "AVAILABLE", "ACCEPTED", "Donation offer accepted by Hope Harvest Foundation",
                    java.util.UUID.randomUUID().toString()
            ));

            // DON-1003 (Delivered)
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    3L, "DON-1003", 1L, null, 1L, "donor@foodbridge.org", "DONOR",
                    "DONATION_CREATED", null, "AVAILABLE", "Donation batch created by Grand Hyatt Metro Canteen (85 packets)",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    3L, "DON-1003", 1L, 2L, 2L, "ngo@foodbridge.org", "NGO",
                    "NGO_ACCEPTED", "AVAILABLE", "ACCEPTED", "Donation offer accepted by Hope Harvest Foundation",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    3L, "DON-1003", 1L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "VOLUNTEER_ASSIGNED", "ACCEPTED", "PICKUP_PENDING", "Delivery task accepted by volunteer David Miller",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    3L, "DON-1003", 1L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "PICKUP_COMPLETED", "PICKUP_PENDING", "PICKED_UP", "Surplus food safely collected from kitchen loading bay",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    3L, "DON-1003", 1L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "DELIVERY_COMPLETED", "IN_TRANSIT", "DELIVERED", "Food successfully delivered to Hope Harvest Foundation",
                    java.util.UUID.randomUUID().toString()
            ));

            // DON-1004 (Expired)
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    4L, "DON-1004", 1L, null, 1L, "donor@foodbridge.org", "DONOR",
                    "DONATION_CREATED", null, "AVAILABLE", "Donation batch created by Grand Hyatt Metro Canteen (30 kg)",
                    java.util.UUID.randomUUID().toString()
            ));
            donationHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DonationHistoryEvent(
                    4L, "DON-1004", 1L, null, null, "system@foodbridge.org", "SYSTEM",
                    "DONATION_EXPIRED", "AVAILABLE", "EXPIRED", "Donation shelf-life expired without collection; preserved for audit",
                    java.util.UUID.randomUUID().toString()
            ));
        }

        if (deliveryHistoryEventRepository.count() == 0) {
            log.info("Seeding initial authentic Delivery Milestone Events...");
            // DEL-101 (In Transit)
            deliveryHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DeliveryHistoryEvent(
                    1L, "DEL-101", 2L, "DON-1002", null, 2L, null, "system@foodbridge.org", "SYSTEM",
                    "DELIVERY_CREATED", null, "PENDING_ASSIGNMENT", "Delivery task generated after NGO acceptance",
                    java.util.UUID.randomUUID().toString()
            ));
            deliveryHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DeliveryHistoryEvent(
                    1L, "DEL-101", 2L, "DON-1002", 3L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "VOLUNTEER_ASSIGNED", "PENDING_ASSIGNMENT", "ACCEPTED", "Delivery task accepted by volunteer David Miller",
                    java.util.UUID.randomUUID().toString()
            ));
            deliveryHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DeliveryHistoryEvent(
                    1L, "DEL-101", 2L, "DON-1002", 3L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "PICKUP_COMPLETED", "PICKUP_PENDING", "PICKED_UP", "Food picked up from Grand Hyatt Metro Canteen",
                    java.util.UUID.randomUUID().toString()
            ));
            deliveryHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DeliveryHistoryEvent(
                    1L, "DEL-101", 2L, "DON-1002", 3L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "IN_TRANSIT", "PICKED_UP", "IN_TRANSIT", "Volunteer en route to Hope Harvest Foundation destination",
                    java.util.UUID.randomUUID().toString()
            ));

            // DEL-102 (Delivered)
            deliveryHistoryEventRepository.save(new com.foodbridge.backend.history.entity.DeliveryHistoryEvent(
                    2L, "DEL-102", 3L, "DON-1003", 3L, 2L, 3L, "volunteer@foodbridge.org", "VOLUNTEER",
                    "DELIVERY_COMPLETED", "IN_TRANSIT", "DELIVERED", "Delivery verified and handed over at Hope Harvest Foundation",
                    java.util.UUID.randomUUID().toString()
            ));
        }
    }
}
