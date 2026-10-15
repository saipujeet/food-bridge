package com.foodbridge.backend.notification.event;

import org.springframework.context.ApplicationEvent;
import java.util.List;

public class DonationAcceptedEvent extends ApplicationEvent {
    private final Long donorId;
    private final Long ngoId;
    private final String ngoName;
    private final Long donationId;
    private final String foodTitle;
    private final List<Long> otherNgoIds;

    public DonationAcceptedEvent(Object source, Long donorId, Long ngoId, String ngoName, Long donationId, String foodTitle, List<Long> otherNgoIds) {
        super(source);
        this.donorId = donorId;
        this.ngoId = ngoId;
        this.ngoName = ngoName;
        this.donationId = donationId;
        this.foodTitle = foodTitle;
        this.otherNgoIds = otherNgoIds;
    }

    public Long getDonorId() { return donorId; }
    public Long getNgoId() { return ngoId; }
    public String getNgoName() { return ngoName; }
    public Long getDonationId() { return donationId; }
    public String getFoodTitle() { return foodTitle; }
    public List<Long> getOtherNgoIds() { return otherNgoIds; }
}
