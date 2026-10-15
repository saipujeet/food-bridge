package com.foodbridge.backend.notification.controller;

import com.foodbridge.backend.notification.event.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class EventTriggerController {

    private final ApplicationEventPublisher eventPublisher;

    public EventTriggerController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/trigger-event")
    public ResponseEntity<String> triggerEvent(
            @RequestParam String eventType,
            @RequestParam(defaultValue = "1") Long donorId,
            @RequestParam(defaultValue = "2") Long ngoId,
            @RequestParam(defaultValue = "3") Long volunteerId,
            @RequestParam(defaultValue = "101") Long donationId,
            @RequestParam(defaultValue = "Fresh Surplus Meals") String foodTitle
    ) {
        switch (eventType.toUpperCase()) {
            case "DONATION_CREATED":
                eventPublisher.publishEvent(new DonationCreatedEvent(this, donorId, donationId, foodTitle));
                break;
            case "MATCH_FOUND":
                eventPublisher.publishEvent(new MatchFoundEvent(this, donorId, List.of(ngoId), donationId, foodTitle));
                break;
            case "MATCH_RADIUS_EXPANDED":
                eventPublisher.publishEvent(new MatchRadiusExpandedEvent(this, donorId, donationId, foodTitle, 10));
                break;
            case "DONATION_ACCEPTED":
                eventPublisher.publishEvent(new DonationAcceptedEvent(this, donorId, ngoId, "Green Hope NGO", donationId, foodTitle, List.of(99L)));
                break;
            case "VOLUNTEER_ASSIGNED":
                eventPublisher.publishEvent(new VolunteerAssignedEvent(this, donorId, ngoId, volunteerId, "Alex Rivera", 501L, donationId, foodTitle));
                break;
            case "FOOD_PICKED_UP":
                eventPublisher.publishEvent(new FoodPickedUpEvent(this, donorId, ngoId, volunteerId, 501L, donationId, foodTitle));
                break;
            case "DELIVERY_STARTED":
                eventPublisher.publishEvent(new DeliveryStartedEvent(this, donorId, ngoId, volunteerId, 501L, donationId, foodTitle));
                break;
            case "DELIVERY_COMPLETED":
                eventPublisher.publishEvent(new DeliveryCompletedEvent(this, donorId, ngoId, volunteerId, 501L, donationId, foodTitle));
                break;
            case "DONATION_EXPIRED":
                eventPublisher.publishEvent(new DonationExpiredEvent(this, donorId, donationId, foodTitle));
                break;
            default:
                return ResponseEntity.badRequest().body("Unknown eventType: " + eventType);
        }

        return ResponseEntity.ok("Event " + eventType + " triggered successfully!");
    }
}
