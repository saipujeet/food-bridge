package com.foodbridge.backend.delivery.controller;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import com.foodbridge.backend.admin.entity.DonationRecord;
import com.foodbridge.backend.admin.repository.DeliveryRecordRepository;
import com.foodbridge.backend.admin.repository.DonationRecordRepository;
import com.foodbridge.backend.common.dto.ApiResponse;
import com.foodbridge.backend.delivery.dto.DeliveryMapDto;
import com.foodbridge.backend.delivery.dto.DeliveryTaskDto;
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
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryRecordRepository deliveryRecordRepository;
    private final DonationRecordRepository donationRecordRepository;
    private final UserRepository userRepository;
    private final HistoryService historyService;
    private final NotificationService notificationService;

    public DeliveryController(
            DeliveryRecordRepository deliveryRecordRepository,
            DonationRecordRepository donationRecordRepository,
            UserRepository userRepository,
            HistoryService historyService,
            NotificationService notificationService) {
        this.deliveryRecordRepository = deliveryRecordRepository;
        this.donationRecordRepository = donationRecordRepository;
        this.userRepository = userRepository;
        this.historyService = historyService;
        this.notificationService = notificationService;
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DeliveryTaskDto>>> getAvailableDeliveries() {
        List<DeliveryRecord> list = deliveryRecordRepository.findByStatus("PENDING_ASSIGNMENT");
        List<DeliveryTaskDto> dtos = list.stream().map(DeliveryTaskDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<DeliveryTaskDto>>> getVolunteerDeliveries(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList()));
        }

        User vol = userOpt.get();
        List<DeliveryRecord> list = deliveryRecordRepository.findByVolunteerIdOrderByCreatedAtDesc(vol.getId());
        List<DeliveryTaskDto> dtos = list.stream().map(DeliveryTaskDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryTaskDto>> getDeliveryById(@PathVariable String id) {
        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        return recOpt
                .map(r -> ResponseEntity.ok(ApiResponse.ok(new DeliveryTaskDto(r))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found")));
    }

    @GetMapping("/donation/{donationId}")
    public ResponseEntity<ApiResponse<DeliveryTaskDto>> getDeliveryByDonationId(@PathVariable String donationId) {
        List<DeliveryRecord> list = deliveryRecordRepository.findAll();
        Optional<DeliveryRecord> found = list.stream()
                .filter(d -> donationId.equalsIgnoreCase(d.getDonationCode()) ||
                             (d.getDonationId() != null && donationId.equals(String.valueOf(d.getDonationId()))))
                .findFirst();

        return found
                .map(r -> ResponseEntity.ok(ApiResponse.ok(new DeliveryTaskDto(r))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("No delivery task found for donation " + donationId)));
    }

    @PostMapping("/{id}/accept")
    public synchronized ResponseEntity<ApiResponse<DeliveryTaskDto>> acceptDelivery(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {

        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found"));
        }

        DeliveryRecord del = recOpt.get();

        // Concurrency check
        if (!"PENDING_ASSIGNMENT".equals(del.getStatus()) || del.getVolunteerId() != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("CONFLICT: This delivery task has already been accepted by another volunteer."));
        }

        User vol = null;
        if (authentication != null && authentication.isAuthenticated()) {
            vol = userRepository.findByEmail(authentication.getName()).orElse(null);
        }

        Long volId = vol != null ? vol.getId() : 3L;
        String volName = vol != null ? vol.getName() : "David Miller";
        String volPhone = vol != null && vol.getPhone() != null ? vol.getPhone() : "+91 98480 77777";

        String prevStatus = del.getStatus();
        del.setVolunteerId(volId);
        del.setVolunteerName(volName);
        del.setVolunteerPhone(volPhone);
        del.setStatus("ACCEPTED");
        del.setAssignedAt(LocalDateTime.now());
        del.setVersion(del.getVersion() + 1);

        DeliveryRecord saved = deliveryRecordRepository.save(del);

        // Update linked donation if exists
        Optional<DonationRecord> donOpt = donationRecordRepository.findByDonationCode(saved.getDonationCode());
        if (donOpt.isPresent()) {
            DonationRecord don = donOpt.get();
            don.setStatus("PICKUP_PENDING");
            don.setAssignedVolunteerId(volId);
            don.setAssignedVolunteerName(volName);
            donationRecordRepository.save(don);
        }

        // Record history event
        historyService.recordDeliveryEvent(
                saved.getId(),
                saved.getDeliveryCode(),
                saved.getDonationId(),
                saved.getDonationCode(),
                volId,
                saved.getNgoId(),
                volId,
                vol != null ? vol.getEmail() : "volunteer@foodbridge.org",
                "VOLUNTEER",
                "VOLUNTEER_ASSIGNED",
                prevStatus,
                "ACCEPTED",
                "Delivery task accepted by volunteer " + volName,
                null
        );

        // Notify donor, NGO, volunteer
        try {
            if (vol != null) {
                notificationService.createAndSendNotification(
                        vol.getId(),
                        NotificationType.DELIVERY_ACCEPTED,
                        "Delivery Task Accepted",
                        "You accepted delivery for task " + saved.getDeliveryCode() + ". Please proceed to donor location.",
                        NotificationPriority.NORMAL,
                        "DELIVERY",
                        saved.getId()
                );
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok("Delivery task accepted successfully", new DeliveryTaskDto(saved)));
    }

    @PostMapping("/{id}/pickup")
    public ResponseEntity<ApiResponse<DeliveryTaskDto>> confirmPickup(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {

        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found"));
        }

        DeliveryRecord del = recOpt.get();
        String prevStatus = del.getStatus();
        del.setStatus("PICKED_UP");
        del.setPickedUpAt(LocalDateTime.now());
        del.setVersion(del.getVersion() + 1);
        DeliveryRecord saved = deliveryRecordRepository.save(del);

        // Update linked donation
        Optional<DonationRecord> donOpt = donationRecordRepository.findByDonationCode(saved.getDonationCode());
        if (donOpt.isPresent()) {
            DonationRecord don = donOpt.get();
            don.setStatus("PICKED_UP");
            donationRecordRepository.save(don);
        }

        // Record history event
        String actorEmail = authentication != null ? authentication.getName() : "volunteer@foodbridge.org";
        historyService.recordDeliveryEvent(
                saved.getId(),
                saved.getDeliveryCode(),
                saved.getDonationId(),
                saved.getDonationCode(),
                saved.getVolunteerId(),
                saved.getNgoId(),
                saved.getVolunteerId(),
                actorEmail,
                "VOLUNTEER",
                "PICKUP_COMPLETED",
                prevStatus,
                "PICKED_UP",
                "Food collected from donor location loading point",
                null
        );

        return ResponseEntity.ok(ApiResponse.ok("Pickup confirmed", new DeliveryTaskDto(saved)));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<DeliveryTaskDto>> startDelivery(
            @PathVariable String id,
            Authentication authentication) {

        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found"));
        }

        DeliveryRecord del = recOpt.get();
        String prevStatus = del.getStatus();
        del.setStatus("IN_TRANSIT");
        del.setInTransitAt(LocalDateTime.now());
        del.setVersion(del.getVersion() + 1);
        DeliveryRecord saved = deliveryRecordRepository.save(del);

        // Update linked donation
        Optional<DonationRecord> donOpt = donationRecordRepository.findByDonationCode(saved.getDonationCode());
        if (donOpt.isPresent()) {
            DonationRecord don = donOpt.get();
            don.setStatus("IN_TRANSIT");
            donationRecordRepository.save(don);
        }

        String actorEmail = authentication != null ? authentication.getName() : "volunteer@foodbridge.org";
        historyService.recordDeliveryEvent(
                saved.getId(),
                saved.getDeliveryCode(),
                saved.getDonationId(),
                saved.getDonationCode(),
                saved.getVolunteerId(),
                saved.getNgoId(),
                saved.getVolunteerId(),
                actorEmail,
                "VOLUNTEER",
                "IN_TRANSIT",
                prevStatus,
                "IN_TRANSIT",
                "Volunteer en route to delivery destination",
                null
        );

        return ResponseEntity.ok(ApiResponse.ok("Delivery transit started", new DeliveryTaskDto(saved)));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<DeliveryTaskDto>> completeDelivery(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {

        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found"));
        }

        DeliveryRecord del = recOpt.get();
        String prevStatus = del.getStatus();
        LocalDateTime now = LocalDateTime.now();
        del.setStatus("DELIVERED");
        del.setDeliveredAt(now);
        del.setVersion(del.getVersion() + 1);
        DeliveryRecord saved = deliveryRecordRepository.save(del);

        // Update linked donation
        Optional<DonationRecord> donOpt = donationRecordRepository.findByDonationCode(saved.getDonationCode());
        if (donOpt.isPresent()) {
            DonationRecord don = donOpt.get();
            don.setStatus("DELIVERED");
            don.setDeliveredAt(now);
            donationRecordRepository.save(don);
        }

        String actorEmail = authentication != null ? authentication.getName() : "volunteer@foodbridge.org";
        historyService.recordDeliveryEvent(
                saved.getId(),
                saved.getDeliveryCode(),
                saved.getDonationId(),
                saved.getDonationCode(),
                saved.getVolunteerId(),
                saved.getNgoId(),
                saved.getVolunteerId(),
                actorEmail,
                "VOLUNTEER",
                "DELIVERY_COMPLETED",
                prevStatus,
                "DELIVERED",
                "Food delivery verified and completed at NGO center",
                null
        );

        return ResponseEntity.ok(ApiResponse.ok("Delivery completed successfully", new DeliveryTaskDto(saved)));
    }

    @GetMapping("/{id}/map")
    public ResponseEntity<ApiResponse<DeliveryMapDto>> getDeliveryMapPayload(@PathVariable String id) {
        Optional<DeliveryRecord> recOpt = findDeliveryByIdOrCode(id);
        if (recOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Delivery task not found"));
        }

        DeliveryRecord del = recOpt.get();

        Map<String, Object> donorLoc = new HashMap<>();
        donorLoc.put("name", del.getDonorName());
        donorLoc.put("address", del.getPickupAddress());
        donorLoc.put("latitude", del.getPickupLatitude() != null ? del.getPickupLatitude() : 15.505);
        donorLoc.put("longitude", del.getPickupLongitude() != null ? del.getPickupLongitude() : 80.049);

        Map<String, Object> ngoLoc = new HashMap<>();
        ngoLoc.put("name", del.getNgoName());
        ngoLoc.put("address", del.getDestinationAddress());
        ngoLoc.put("latitude", del.getDropLatitude() != null ? del.getDropLatitude() : 15.5006);
        ngoLoc.put("longitude", del.getDropLongitude() != null ? del.getDropLongitude() : 80.0532);

        Map<String, Object> volLoc = new HashMap<>();
        volLoc.put("name", del.getVolunteerName() != null ? del.getVolunteerName() : "Assigned Volunteer");
        volLoc.put("latitude", del.getLastVolunteerLat() != null ? del.getLastVolunteerLat() : 15.503);
        volLoc.put("longitude", del.getLastVolunteerLng() != null ? del.getLastVolunteerLng() : 80.051);

        DeliveryMapDto mapDto = new DeliveryMapDto(
                del.getDeliveryCode(),
                del.getStatus(),
                donorLoc,
                ngoLoc,
                volLoc,
                del.getDistanceKm() != null ? del.getDistanceKm() : 1.8,
                "DELIVERED".equals(del.getStatus()) ? 0.0 : 0.8
        );

        return ResponseEntity.ok(ApiResponse.ok(mapDto));
    }

    private Optional<DeliveryRecord> findDeliveryByIdOrCode(String idOrCode) {
        Optional<DeliveryRecord> opt = deliveryRecordRepository.findByDeliveryCode(idOrCode);
        if (opt.isPresent()) return opt;
        try {
            long numId = Long.parseLong(idOrCode);
            return deliveryRecordRepository.findById(numId);
        } catch (NumberFormatException e) {
            return Optional.empty();
        }
    }
}
