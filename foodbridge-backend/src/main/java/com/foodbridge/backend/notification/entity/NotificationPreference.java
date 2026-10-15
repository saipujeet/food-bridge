package com.foodbridge.backend.notification.entity;

import com.foodbridge.backend.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "in_app_enabled", nullable = false)
    private boolean inAppEnabled = true;

    @Column(name = "browser_enabled", nullable = false)
    private boolean browserEnabled = false;

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled = false;

    @Column(name = "donation_updates", nullable = false)
    private boolean donationUpdates = true;

    @Column(name = "matching_updates", nullable = false)
    private boolean matchingUpdates = true;

    @Column(name = "delivery_updates", nullable = false)
    private boolean deliveryUpdates = true;

    @Column(name = "system_updates", nullable = false)
    private boolean systemUpdates = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public NotificationPreference() {}

    public NotificationPreference(User user) {
        this.user = user;
        this.inAppEnabled = true;
        this.browserEnabled = false;
        this.emailEnabled = false;
        this.donationUpdates = true;
        this.matchingUpdates = true;
        this.deliveryUpdates = true;
        this.systemUpdates = true;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public boolean isInAppEnabled() { return inAppEnabled; }
    public void setInAppEnabled(boolean inAppEnabled) { this.inAppEnabled = inAppEnabled; }

    public boolean isBrowserEnabled() { return browserEnabled; }
    public void setBrowserEnabled(boolean browserEnabled) { this.browserEnabled = browserEnabled; }

    public boolean isEmailEnabled() { return emailEnabled; }
    public void setEmailEnabled(boolean emailEnabled) { this.emailEnabled = emailEnabled; }

    public boolean isDonationUpdates() { return donationUpdates; }
    public void setDonationUpdates(boolean donationUpdates) { this.donationUpdates = donationUpdates; }

    public boolean isMatchingUpdates() { return matchingUpdates; }
    public void setMatchingUpdates(boolean matchingUpdates) { this.matchingUpdates = matchingUpdates; }

    public boolean isDeliveryUpdates() { return deliveryUpdates; }
    public void setDeliveryUpdates(boolean deliveryUpdates) { this.deliveryUpdates = deliveryUpdates; }

    public boolean isSystemUpdates() { return systemUpdates; }
    public void setSystemUpdates(boolean systemUpdates) { this.systemUpdates = systemUpdates; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
