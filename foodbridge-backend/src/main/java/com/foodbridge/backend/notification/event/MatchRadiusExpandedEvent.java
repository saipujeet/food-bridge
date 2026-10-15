package com.foodbridge.backend.notification.event;

import org.springframework.context.ApplicationEvent;

public class MatchRadiusExpandedEvent extends ApplicationEvent {
    private final Long donorId;
    private final Long donationId;
    private final String foodTitle;
    private final int newRadiusKm;

    public MatchRadiusExpandedEvent(Object source, Long donorId, Long donationId, String foodTitle, int newRadiusKm) {
        super(source);
        this.donorId = donorId;
        this.donationId = donationId;
        this.foodTitle = foodTitle;
        this.newRadiusKm = newRadiusKm;
    }

    public Long getDonorId() { return donorId; }
    public Long getDonationId() { return donationId; }
    public String getFoodTitle() { return foodTitle; }
    public int getNewRadiusKm() { return newRadiusKm; }
}
