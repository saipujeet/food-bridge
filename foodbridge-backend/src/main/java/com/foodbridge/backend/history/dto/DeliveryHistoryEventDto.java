package com.foodbridge.backend.history.dto;

import com.foodbridge.backend.history.entity.DeliveryHistoryEvent;
import java.time.LocalDateTime;

public class DeliveryHistoryEventDto {

    private Long id;
    private Long deliveryId;
    private String deliveryCode;
    private Long donationId;
    private String donationCode;
    private Long volunteerId;
    private Long ngoId;
    private Long actorId;
    private String actorEmail;
    private String actorRole;
    private String eventType;
    private String previousStatus;
    private String newStatus;
    private String description;
    private String correlationId;
    private LocalDateTime createdAt;

    public DeliveryHistoryEventDto() {}

    public DeliveryHistoryEventDto(DeliveryHistoryEvent event) {
        if (event != null) {
            this.id = event.getId();
            this.deliveryId = event.getDeliveryId();
            this.deliveryCode = event.getDeliveryCode();
            this.donationId = event.getDonationId();
            this.donationCode = event.getDonationCode();
            this.volunteerId = event.getVolunteerId();
            this.ngoId = event.getNgoId();
            this.actorId = event.getActorId();
            this.actorEmail = event.getActorEmail();
            this.actorRole = event.getActorRole();
            this.eventType = event.getEventType();
            this.previousStatus = event.getPreviousStatus();
            this.newStatus = event.getNewStatus();
            this.description = event.getDescription();
            this.correlationId = event.getCorrelationId();
            this.createdAt = event.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDeliveryId() { return deliveryId; }
    public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

    public String getDeliveryCode() { return deliveryCode; }
    public void setDeliveryCode(String deliveryCode) { this.deliveryCode = deliveryCode; }

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationCode() { return donationCode; }
    public void setDonationCode(String donationCode) { this.donationCode = donationCode; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
