package com.foodbridge.backend.history.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_history_events", indexes = {
    @Index(name = "idx_don_hist_donation_id", columnList = "donationId"),
    @Index(name = "idx_don_hist_donation_code", columnList = "donationCode"),
    @Index(name = "idx_don_hist_donor_id", columnList = "donorId"),
    @Index(name = "idx_don_hist_ngo_id", columnList = "matchedNgoId"),
    @Index(name = "idx_don_hist_created_at", columnList = "createdAt"),
    @Index(name = "idx_don_hist_event_type", columnList = "eventType")
})
public class DonationHistoryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donationId;

    private String donationCode;

    private Long donorId;

    private Long matchedNgoId;

    private Long actorId;

    private String actorEmail;

    private String actorRole; // DONOR, NGO, VOLUNTEER, ADMIN, SYSTEM

    @Column(nullable = false)
    private String eventType; // DONATION_CREATED, DONATION_UPDATED, NGO_ACCEPTED, VOLUNTEER_ASSIGNED, PICKUP_COMPLETED, DELIVERY_COMPLETED, DONATION_CANCELLED, DONATION_EXPIRED

    private String previousStatus;

    private String newStatus;

    @Column(length = 1000)
    private String description;

    private String correlationId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public DonationHistoryEvent() {}

    public DonationHistoryEvent(Long donationId, String donationCode, Long donorId, Long matchedNgoId,
                                Long actorId, String actorEmail, String actorRole,
                                String eventType, String previousStatus, String newStatus,
                                String description, String correlationId) {
        this.donationId = donationId;
        this.donationCode = donationCode;
        this.donorId = donorId;
        this.matchedNgoId = matchedNgoId;
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

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationCode() { return donationCode; }
    public void setDonationCode(String donationCode) { this.donationCode = donationCode; }

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }

    public Long getMatchedNgoId() { return matchedNgoId; }
    public void setMatchedNgoId(Long matchedNgoId) { this.matchedNgoId = matchedNgoId; }

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
