package com.foodbridge.backend.notification.event;

import org.springframework.context.ApplicationEvent;

public class FoodPickedUpEvent extends ApplicationEvent {
    private final Long donorId;
    private final Long ngoId;
    private final Long volunteerId;
    private final Long deliveryId;
    private final Long donationId;
    private final String foodTitle;

    public FoodPickedUpEvent(Object source, Long donorId, Long ngoId, Long volunteerId, Long deliveryId, Long donationId, String foodTitle) {
        super(source);
        this.donorId = donorId;
        this.ngoId = ngoId;
        this.volunteerId = volunteerId;
        this.deliveryId = deliveryId;
        this.donationId = donationId;
        this.foodTitle = foodTitle;
    }

    public Long getDonorId() { return donorId; }
    public Long getNgoId() { return ngoId; }
    public Long getVolunteerId() { return volunteerId; }
    public Long getDeliveryId() { return deliveryId; }
    public Long getDonationId() { return donationId; }
    public String getFoodTitle() { return foodTitle; }
}
