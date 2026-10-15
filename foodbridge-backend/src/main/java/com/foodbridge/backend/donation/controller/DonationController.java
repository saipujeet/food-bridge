package com.foodbridge.backend.donation.controller;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.donation.dto.DonationDto;
import com.foodbridge.backend.history.service.HistoryService;
import com.foodbridge.backend.notification.entity.NotificationPriority;
import com.foodbridge.backend.notification.entity.NotificationType;
import com.foodbridge.backend.notification.service.NotificationService;
import com.foodbridge.backend.user.User;
import com.foodbridge.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationRecordRepository donationRecordRepository;
    private final DeliveryRecordRepository deliveryRecordRepository;
    private final UserRepository userRepository;
    private final HistoryService historyService;
    private final NotificationService notificationService;

    public DonationController(
            DonationRecordRepository donationRecordRepository,
            DeliveryRecordRepository deliveryRecordRepository,
            UserRepository userRepository,
            HistoryService historyService,
            NotificationService notificationService) {
        this.donationRecordRepository = donationRecordRepository;
        this.deliveryRecordRepository = deliveryRecordRepository;
        this.userRepository = userRepository;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<DonationDto>>> getMyDonations(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList()));
        }

        User user = userOpt.get();
        List<DonationRecord> list = donationRecordRepository.findByDonorIdOrderByCreatedAtDesc(user.getId());
        List<DonationDto> dtos = list.stream().map(DonationDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonationDto>>> getAllDonations() {
        List<DonationRecord> list = donationRecordRepository.findAllByOrderByCreatedAtDesc();
        List<DonationDto> dtos = list.stream().map(DonationDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonationDto>> getDonationById(@PathVariable String id) {
        Optional<DonationRecord> recOpt = findRecordByIdOrCode(id);
        return recOpt
                .map(r -> ResponseEntity.ok(ApiResponse.ok(new DonationDto(r))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Donation record not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DonationDto>> createDonation(
            Authentication authentication,
            @RequestBody Map<String, Object> body) {

        String foodName = (String) body.get("foodName");
        if (foodName == null || foodName.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Food name is required."));
        }

        Double quantity = 10.0;
        if (body.get("quantity") != null) {
            try {
                quantity = Double.parseDouble(String.valueOf(body.get("quantity")));
            } catch (NumberFormatException ignored) {}
        }
        if (quantity <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Donation quantity must be greater than zero."));
        }

        User donor = null;
        if (authentication != null && authentication.isAuthenticated()) {
            donor = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        long count = donationRecordRepository.count();
        String code = "DON-" + (1000 + count + 1);

        String unit = body.get("unit") != null ? String.valueOf(body.get("unit")) : "kg";
        String category = body.get("foodCategory") != null ? String.valueOf(body.get("foodCategory")) : "Cooked Meals";
        String foodType = body.get("foodType") != null ? String.valueOf(body.get("foodType")) : "Vegetarian";
        String desc = body.get("description") != null ? String.valueOf(body.get("description")) : "";
        String specialInstructions = body.get("specialInstructions") != null ? String.valueOf(body.get("specialInstructions")) : "";
        String prepDate = body.get("preparationDate") != null ? String.valueOf(body.get("preparationDate")) : LocalDateTime.now().toLocalDate().toString();
        String prepTime = body.get("preparationTime") != null ? String.valueOf(body.get("preparationTime")) : "12:00";
        String imageUrl = body.get("imageUrl") != null ? String.valueOf(body.get("imageUrl")) : "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60";

        LocalDateTime availableUntil = LocalDateTime.now().plusHours(12);
        if (body.get("availableUntil") != null) {
            try {
                availableUntil = LocalDateTime.parse(String.valueOf(body.get("availableUntil")).substring(0, 19));
            } catch (Exception ignored) {}
        }

        Double lat = 15.505;
        Double lng = 80.049;
        if (body.get("latitude") != null) {
            try { lat = Double.parseDouble(String.valueOf(body.get("latitude"))); } catch (Exception ignored) {}
        }
        if (body.get("longitude") != null) {
            try { lng = Double.parseDouble(String.valueOf(body.get("longitude"))); } catch (Exception ignored) {}
        }

        Long donorId = donor != null ? donor.getId() : 1L;
        String donorName = donor != null ? donor.getName() : (body.get("donorName") != null ? String.valueOf(body.get("donorName")) : "Food Donor");
        String donorCity = donor != null && donor.getCity() != null ? donor.getCity() : (body.get("donorCity") != null ? String.valueOf(body.get("donorCity")) : "Ongole");
        String donorAddress = donor != null && donor.getAddress() != null ? donor.getAddress() : (body.get("donorAddress") != null ? String.valueOf(body.get("donorAddress")) : "Donor Address");
        String donorPhone = donor != null && donor.getPhone() != null ? donor.getPhone() : (body.get("donorPhone") != null ? String.valueOf(body.get("donorPhone")) : "+91 98480 12345");

        DonationRecord rec = new DonationRecord(
                code, donorId, donorName, donorCity, donorAddress,
                foodName, category, quantity, unit, "AVAILABLE",
                availableUntil, 5.0, "STAGE_1_5KM"
        );
        rec.setDonorPhone(donorPhone);
        rec.setLatitude(lat);
        rec.setLongitude(lng);
        rec.setFoodType(foodType);
        rec.setDescription(desc);
        rec.setImageUrl(imageUrl);
        rec.setSpecialInstructions(specialInstructions);
        rec.setPreparationDate(prepDate);
        rec.setPreparationTime(prepTime);
        rec.setAvailableFrom(LocalDateTime.now());

        DonationRecord saved = donationRecordRepository.save(rec);

        // Record history event
        historyService.recordDonationEvent(
                saved.getId(),
                saved.getDonationCode(),
                saved.getDonorId(),
                null,
                donorId,
                donor != null ? donor.getEmail() : "donor@foodbridge.org",
                "DONOR",
                "DONATION_CREATED",
                null,
                "AVAILABLE",
                "Donation offer created for " + saved.getFoodName() + " (" + saved.getQuantity() + " " + saved.getUnit() + ")",
                null
        );

        // Trigger notification
        if (donor != null) {
            notificationService.createAndSendNotification(
                    donor.getId(),
                    NotificationType.DONATION_CREATED,
                    "Donation Created",
                    "Your surplus food offer for '" + saved.getFoodName() + "' was published and search has begun within 5 km radius.",
                    NotificationPriority.NORMAL,
                    "DONATION",
                    saved.getId()
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Donation created successfully", new DonationDto(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DonationDto>> updateDonation(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {

        Optional<DonationRecord> recOpt = findRecordByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Donation not found"));
        }

        DonationRecord r = recOpt.get();
        if (!"AVAILABLE".equals(r.getStatus()) && !"MATCHING".equals(r.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("This donation cannot be updated because its current status is " + r.getStatus()));
        }

        if (body.containsKey("foodName") && body.get("foodName") != null) {
            r.setFoodName(String.valueOf(body.get("foodName")));
        }
        if (body.containsKey("quantity") && body.get("quantity") != null) {
            try { r.setQuantity(Double.parseDouble(String.valueOf(body.get("quantity")))); } catch (Exception ignored) {}
        }
        if (body.containsKey("description") && body.get("description") != null) {
            r.setDescription(String.valueOf(body.get("description")));
        }
        if (body.containsKey("specialInstructions") && body.get("specialInstructions") != null) {
            r.setSpecialInstructions(String.valueOf(body.get("specialInstructions")));
        }

        DonationRecord saved = donationRecordRepository.save(r);
        return ResponseEntity.ok(ApiResponse.ok("Donation updated successfully", new DonationDto(saved)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<DonationDto>> cancelDonation(
            @PathVariable String id,
            Authentication authentication) {

        Optional<DonationRecord> recOpt = findRecordByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Donation not found"));
        }

        DonationRecord r = recOpt.get();
        String prevStatus = r.getStatus();
        r.setStatus("CANCELLED");
        DonationRecord saved = donationRecordRepository.save(r);

        String actorEmail = authentication != null ? authentication.getName() : "donor@foodbridge.org";
        historyService.recordDonationEvent(
                saved.getId(),
                saved.getDonationCode(),
                saved.getDonorId(),
                saved.getMatchedNgoId(),
                saved.getDonorId(),
                actorEmail,
                "DONOR",
                "DONATION_CANCELLED",
                prevStatus,
                "CANCELLED",
                "Donation cancelled by donor",
                null
        );

        return ResponseEntity.ok(ApiResponse.ok("Donation cancelled", new DonationDto(saved)));
    }

    @PostMapping("/{id}/claim")
    public ResponseEntity<ApiResponse<DonationDto>> claimDonation(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {

        Optional<DonationRecord> recOpt = findRecordByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Donation not found"));
        }

        DonationRecord r = recOpt.get();
        if (!"AVAILABLE".equals(r.getStatus()) && !"MATCHING".equals(r.getStatus())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("CONFLICT: This donation has already been accepted or is no longer available."));
        }

        User ngoUser = null;
        if (authentication != null && authentication.isAuthenticated()) {
            ngoUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        Long ngoId = ngoUser != null ? ngoUser.getId() : 2L;
        String ngoName = ngoUser != null ? ngoUser.getOrganizationName() : (body != null && body.get("ngoName") != null ? String.valueOf(body.get("ngoName")) : "Hope Harvest Foundation");

        String prevStatus = r.getStatus();
        r.setStatus("ACCEPTED");
        r.setMatchedNgoId(ngoId);
        r.setMatchedNgoName(ngoName);
        DonationRecord saved = donationRecordRepository.save(r);

        // Record history event
        historyService.recordDonationEvent(
                saved.getId(),
                saved.getDonationCode(),
                saved.getDonorId(),
                ngoId,
                ngoId,
                ngoUser != null ? ngoUser.getEmail() : "ngo@foodbridge.org",
                "NGO",
                "NGO_ACCEPTED",
                prevStatus,
                "ACCEPTED",
                "Donation claimed and accepted by " + ngoName,
                null
        );

        // Auto-create Delivery Task for accepted donation
        long deliveryCount = deliveryRecordRepository.count();
        String delCode = "DEL-" + (100 + deliveryCount + 1);
        DeliveryRecord del = new DeliveryRecord(
                delCode,
                saved.getId(),
                saved.getDonationCode(),
                saved.getDonorName(),
                saved.getDonorAddress(),
                ngoName,
                ngoUser != null && ngoUser.getAddress() != null ? ngoUser.getAddress() : "108 Compassion Ave, Ongole",
                null,
                null,
                "PENDING_ASSIGNMENT"
        );
        deliveryRecordRepository.save(del);

        return ResponseEntity.ok(ApiResponse.ok("Donation accepted successfully", new DonationDto(saved)));
    }

    private Optional<DonationRecord> findRecordByIdOrCode(String idOrCode) {
        Optional<DonationRecord> opt = donationRecordRepository.findByDonationCode(idOrCode);
        if (opt.isPresent()) return opt;
        try {
            long numId = Long.parseLong(idOrCode);
            return donationRecordRepository.findById(numId);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
