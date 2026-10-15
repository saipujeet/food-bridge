package com.foodbridge.backend.history.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_history_events", indexes = {
    @Index(name = "idx_del_hist_delivery_id", columnList = "deliveryId"),
    @Index(name = "idx_del_hist_delivery_code", columnList = "deliveryCode"),
    @Index(name = "idx_del_hist_donation_id", columnList = "donationId"),
    @Index(name = "idx_del_hist_volunteer_id", columnList = "volunteerId"),
    @Index(name = "idx_del_hist_ngo_id", columnList = "ngoId"),
    @Index(name = "idx_del_hist_created_at", columnList = "createdAt"),
    @Index(name = "idx_del_hist_event_type", columnList = "eventType")
})
public class DeliveryHistoryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long deliveryId;

    private String deliveryCode;

    private Long donationId;

    private String donationCode;

    private Long volunteerId;

    private Long ngoId;

    private Long actorId;

    private String actorEmail;

    private String actorRole; // VOLUNTEER, NGO, ADMIN, SYSTEM

    @Column(nullable = false)
    private String eventType; // DELIVERY_CREATED, VOLUNTEER_ASSIGNED, PICKUP_PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, DELIVERY_CANCELLED, DELIVERY_REASSIGNED

    private String previousStatus;

    private String newStatus;

    @Column(length = 1000)
    private String description;

    private String correlationId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public DeliveryHistoryEvent() {}

    public DeliveryHistoryEvent(Long deliveryId, String deliveryCode, Long donationId, String donationCode,
                                Long volunteerId, Long ngoId, Long actorId, String actorEmail, String actorRole,
                                String eventType, String previousStatus, String newStatus,
                                String description, String correlationId) {
        this.deliveryId = deliveryId;
        this.deliveryCode = deliveryCode;
        this.donationId = donationId;
        this.donationCode = donationCode;
        this.volunteerId = volunteerId;
        this.ngoId = ngoId;
        this.actorId = actorId;
        this.actorEmail = actorEmail;
        this.actorRole = actorRole != null ? actorRole : "SYSTEM";
        this.eventType = eventType;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.description = description;
        this.correlationId = correlationId;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
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
