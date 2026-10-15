package com.foodbridge.backend.notification.event;

import com.foodbridge.backend.notification.entity.NotificationPriority;
import com.foodbridge.backend.notification.entity.NotificationType;
import com.foodbridge.backend.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleDonationCreated(DonationCreatedEvent event) {
        log.info("Handling DonationCreatedEvent for donation {}", event.getDonationId());
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.DONATION_CREATED,
                "Donation Created",
                "Your food donation '" + event.getFoodTitle() + "' has been created and submitted for matching.",
                NotificationPriority.NORMAL,
                "DONATION",
                event.getDonationId()
        );
    }

    @EventListener
    public void handleMatchFound(MatchFoundEvent event) {
        log.info("Handling MatchFoundEvent for donation {}", event.getDonationId());
        // Notify Donor
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.MATCH_FOUND,
                "Eligible NGO Matches Found",
                "We found eligible NGOs for your food donation '" + event.getFoodTitle() + "'.",
                NotificationPriority.NORMAL,
                "DONATION",
                event.getDonationId()
        );

        // Notify Eligible NGOs
        if (event.getEligibleNgoIds() != null) {
            for (Long ngoId : event.getEligibleNgoIds()) {
                notificationService.createAndSendNotification(
                        ngoId,
                        NotificationType.MATCH_FOUND,
                        "New Surplus Food Available",
                        "A new surplus food donation '" + event.getFoodTitle() + "' is available in your area.",
                        NotificationPriority.NORMAL,
                        "DONATION",
                        event.getDonationId()
                );
            }
        }
    }

    @EventListener
    public void handleMatchRadiusExpanded(MatchRadiusExpandedEvent event) {
        log.info("Handling MatchRadiusExpandedEvent for donation {}", event.getDonationId());
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.MATCH_RADIUS_EXPANDED,
                "Search Radius Expanded",
                "Search area for '" + event.getFoodTitle() + "' has been expanded to " + event.getNewRadiusKm() + " km to find eligible NGOs.",
                NotificationPriority.NORMAL,
                "DONATION",
                event.getDonationId()
        );
    }

    @EventListener
    public void handleDonationAccepted(DonationAcceptedEvent event) {
        log.info("Handling DonationAcceptedEvent for donation {}", event.getDonationId());
        // Notify Donor
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.DONATION_ACCEPTED,
                "Donation Accepted",
                "Your food donation '" + event.getFoodTitle() + "' has been accepted by " + event.getNgoName() + ".",
                NotificationPriority.HIGH,
                "DONATION",
                event.getDonationId()
        );

        // Notify Accepting NGO
        notificationService.createAndSendNotification(
                event.getNgoId(),
                NotificationType.DONATION_ACCEPTED,
                "Donation Accepted Successfully",
                "You have successfully accepted food donation '" + event.getFoodTitle() + "'. Awaiting volunteer assignment.",
                NotificationPriority.HIGH,
                "DONATION",
                event.getDonationId()
        );

        // Notify Other NGOs with active offers
        if (event.getOtherNgoIds() != null) {
            for (Long otherId : event.getOtherNgoIds()) {
                notificationService.createAndSendNotification(
                        otherId,
                        NotificationType.DONATION_REJECTED,
                        "Donation No Longer Available",
                        "Food donation '" + event.getFoodTitle() + "' has been claimed by another organization.",
                        NotificationPriority.LOW,
                        "DONATION",
                        event.getDonationId()
                );
            }
        }
    }

    @EventListener
    public void handleVolunteerAssigned(VolunteerAssignedEvent event) {
        log.info("Handling VolunteerAssignedEvent for delivery {}", event.getDeliveryId());
        // Notify Donor
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.VOLUNTEER_ASSIGNED,
                "Volunteer Assigned",
                "Volunteer " + event.getVolunteerName() + " has been assigned to pick up your donation '" + event.getFoodTitle() + "'.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );

        // Notify NGO
        notificationService.createAndSendNotification(
                event.getNgoId(),
                NotificationType.VOLUNTEER_ASSIGNED,
                "Volunteer Assigned to Delivery",
                "Volunteer " + event.getVolunteerName() + " will deliver accepted food donation '" + event.getFoodTitle() + "'.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );

        // Notify Volunteer
        notificationService.createAndSendNotification(
                event.getVolunteerId(),
                NotificationType.DELIVERY_ACCEPTED,
                "Delivery Task Assigned",
                "You have been assigned to deliver surplus food donation '" + event.getFoodTitle() + "'.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );
    }

    @EventListener
    public void handleFoodPickedUp(FoodPickedUpEvent event) {
        log.info("Handling FoodPickedUpEvent for delivery {}", event.getDeliveryId());
        // Notify NGO
        notificationService.createAndSendNotification(
                event.getNgoId(),
                NotificationType.FOOD_PICKED_UP,
                "Food Picked Up",
                "Surplus food donation '" + event.getFoodTitle() + "' has been picked up from donor and is on the way.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );

        // Notify Donor
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.FOOD_PICKED_UP,
                "Donation Picked Up",
                "Your food donation '" + event.getFoodTitle() + "' was picked up by the volunteer.",
                NotificationPriority.NORMAL,
                "DELIVERY",
                event.getDeliveryId()
        );
    }

    @EventListener
    public void handleDeliveryStarted(DeliveryStartedEvent event) {
        log.info("Handling DeliveryStartedEvent for delivery {}", event.getDeliveryId());
        notificationService.createAndSendNotification(
                event.getNgoId(),
                NotificationType.DELIVERY_STARTED,
                "Delivery In Transit",
                "Delivery for '" + event.getFoodTitle() + "' is actively in transit to your facility.",
                NotificationPriority.NORMAL,
                "DELIVERY",
                event.getDeliveryId()
        );
    }

    @EventListener
    public void handleDeliveryCompleted(DeliveryCompletedEvent event) {
        log.info("Handling DeliveryCompletedEvent for delivery {}", event.getDeliveryId());
        // Notify Donor
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.DELIVERY_COMPLETED,
                "Delivery Completed",
                "Your surplus food donation '" + event.getFoodTitle() + "' has been successfully delivered to the NGO!",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );

        // Notify NGO
        notificationService.createAndSendNotification(
                event.getNgoId(),
                NotificationType.DELIVERY_COMPLETED,
                "Food Delivered",
                "Food donation '" + event.getFoodTitle() + "' has been safely delivered to your location.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );

        // Notify Volunteer
        notificationService.createAndSendNotification(
                event.getVolunteerId(),
                NotificationType.DELIVERY_COMPLETED,
                "Task Completed",
                "Thank you! You successfully completed delivery for '" + event.getFoodTitle() + "'.",
                NotificationPriority.HIGH,
                "DELIVERY",
                event.getDeliveryId()
        );
    }

    @EventListener
    public void handleDonationExpired(DonationExpiredEvent event) {
        log.info("Handling DonationExpiredEvent for donation {}", event.getDonationId());
        notificationService.createAndSendNotification(
                event.getDonorId(),
                NotificationType.DONATION_EXPIRED,
                "Donation Expired",
                "Your food donation '" + event.getFoodTitle() + "' has expired before an NGO acceptance could be completed.",
                NotificationPriority.URGENT,
                "DONATION",
                event.getDonationId()
        );
    }
}
