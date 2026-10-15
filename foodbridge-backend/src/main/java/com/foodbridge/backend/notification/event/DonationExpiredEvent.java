package com.foodbridge.backend.notification.event;

import org.springframework.context.ApplicationEvent;

public class DonationExpiredEvent extends ApplicationEvent {
    private final Long donorId;
    private final Long donationId;
    private final String foodTitle;

    public DonationExpiredEvent(Object source, Long donorId, Long donationId, String foodTitle) {
        super(source);
        this.donorId = donorId;
        this.donationId = donationId;
        this.foodTitle = foodTitle;
    }

    public Long getDonorId() { return donorId; }
    public Long getDonationId() { return donationId; }
    public String getFoodTitle() { return foodTitle; }
}
