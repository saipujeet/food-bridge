package com.foodbridge.backend.delivery.dto;

import java.util.Map;

public class DeliveryMapDto {
    private String deliveryId;
    private String status;
    private Map<String, Object> donorLocation;
    private Map<String, Object> ngoLocation;
    private Map<String, Object> volunteerLocation;
    private Double totalDistanceKm;
    private Double remainingDistanceKm;

    public DeliveryMapDto() {}

    public DeliveryMapDto(String deliveryId, String status, Map<String, Object> donorLocation,
                          Map<String, Object> ngoLocation, Map<String, Object> volunteerLocation,
                          Double totalDistanceKm, Double remainingDistanceKm) {
        this.deliveryId = deliveryId;
        this.status = status;
        this.donorLocation = donorLocation;
        this.ngoLocation = ngoLocation;
        this.volunteerLocation = volunteerLocation;
        this.totalDistanceKm = totalDistanceKm;
        this.remainingDistanceKm = remainingDistanceKm;
    }

    public String getDeliveryId() { return deliveryId; }
    public void setDeliveryId(String deliveryId) { this.deliveryId = deliveryId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getDonorLocation() { return donorLocation; }
    public void setDonorLocation(Map<String, Object> donorLocation) { this.donorLocation = donorLocation; }

    public Map<String, Object> getNgoLocation() { return ngoLocation; }
    public void setNgoLocation(Map<String, Object> ngoLocation) { this.ngoLocation = ngoLocation; }

    public Map<String, Object> getVolunteerLocation() { return volunteerLocation; }
    public void setVolunteerLocation(Map<String, Object> volunteerLocation) { this.volunteerLocation = volunteerLocation; }

    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Double getRemainingDistanceKm() { return remainingDistanceKm; }
    public void setRemainingDistanceKm(Double remainingDistanceKm) { this.remainingDistanceKm = remainingDistanceKm; }
}
