package com.foodbridge.backend.analytics.dto;

public class DistributionStatusDto {
    private String status;
    private long count;
    private double foodKg;
    private double percentage;

    public DistributionStatusDto() {}

    public DistributionStatusDto(String status, long count, double foodKg, double percentage) {
        this.status = status;
        this.count = count;
        this.foodKg = foodKg;
        this.percentage = percentage;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }

    public double getFoodKg() { return foodKg; }
    public void setFoodKg(double foodKg) { this.foodKg = foodKg; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
