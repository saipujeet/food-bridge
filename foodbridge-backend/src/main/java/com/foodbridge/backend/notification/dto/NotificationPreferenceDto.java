package com.foodbridge.backend.notification.dto;

import com.foodbridge.backend.notification.entity.NotificationPreference;

public class NotificationPreferenceDto {
    private boolean inAppEnabled;
    private boolean browserEnabled;
    private boolean emailEnabled;
    private boolean donationUpdates;
    private boolean matchingUpdates;
    private boolean deliveryUpdates;
    private boolean systemUpdates;

    public NotificationPreferenceDto() {}

    public NotificationPreferenceDto(boolean inAppEnabled, boolean browserEnabled, boolean emailEnabled, boolean donationUpdates, boolean matchingUpdates, boolean deliveryUpdates, boolean systemUpdates) {
        this.inAppEnabled = inAppEnabled;
        this.browserEnabled = browserEnabled;
        this.emailEnabled = emailEnabled;
        this.donationUpdates = donationUpdates;
        this.matchingUpdates = matchingUpdates;
        this.deliveryUpdates = deliveryUpdates;
        this.systemUpdates = systemUpdates;
    }

    public static NotificationPreferenceDto fromEntity(NotificationPreference entity) {
        return new NotificationPreferenceDto(
                entity.isInAppEnabled(),
                entity.isBrowserEnabled(),
                entity.isEmailEnabled(),
                entity.isDonationUpdates(),
                entity.isMatchingUpdates(),
                entity.isDeliveryUpdates(),
                entity.isSystemUpdates()
        );
    }

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
}
