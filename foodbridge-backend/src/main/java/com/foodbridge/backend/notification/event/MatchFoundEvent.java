package com.foodbridge.backend.notification.event;

import org.springframework.context.ApplicationEvent;
import java.util.List;

public class MatchFoundEvent extends ApplicationEvent {
    private final Long donorId;
    private final List<Long> eligibleNgoIds;
    private final Long donationId;
    private final String foodTitle;

    public MatchFoundEvent(Object source, Long donorId, List<Long> eligibleNgoIds, Long donationId, String foodTitle) {
        super(source);
        this.donorId = donorId;
        this.eligibleNgoIds = eligibleNgoIds;
        this.donationId = donationId;
        this.foodTitle = foodTitle;
    }

    public Long getDonorId() { return donorId; }
    public List<Long> getEligibleNgoIds() { return eligibleNgoIds; }
    public Long getDonationId() { return donationId; }
    public String getFoodTitle() { return foodTitle; }
}
