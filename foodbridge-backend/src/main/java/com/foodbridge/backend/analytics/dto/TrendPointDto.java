package com.foodbridge.backend.analytics.dto;

public class TrendPointDto {
    private String date; // YYYY-MM-DD
    private long donationsCreated;
    private double foodOfferedKg;
    private double foodDistributedKg;
    private long deliveriesCompleted;

    public TrendPointDto() {}

    public TrendPointDto(String date, long donationsCreated, double foodOfferedKg, double foodDistributedKg, long deliveriesCompleted) {
        this.date = date;
        this.donationsCreated = donationsCreated;
        this.foodOfferedKg = foodOfferedKg;
        this.foodDistributedKg = foodDistributedKg;
        this.deliveriesCompleted = deliveriesCompleted;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public long getDonationsCreated() { return donationsCreated; }
    public void setDonationsCreated(long donationsCreated) { this.donationsCreated = donationsCreated; }

    public double getFoodOfferedKg() { return foodOfferedKg; }
    public void setFoodOfferedKg(double foodOfferedKg) { this.foodOfferedKg = foodOfferedKg; }

    public double getFoodDistributedKg() { return foodDistributedKg; }
    public void setFoodDistributedKg(double foodDistributedKg) { this.foodDistributedKg = foodDistributedKg; }

    public long getDeliveriesCompleted() { return deliveriesCompleted; }
    public void setDeliveriesCompleted(long deliveriesCompleted) { this.deliveriesCompleted = deliveriesCompleted; }
}
