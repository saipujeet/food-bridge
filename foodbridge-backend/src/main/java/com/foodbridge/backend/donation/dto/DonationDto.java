package com.foodbridge.backend.donation.dto;

import com.foodbridge.backend.admin.entity.DonationRecord;
import java.time.format.DateTimeFormatter;

public class DonationDto {
    private String id;
    private String donorId;
    private String donorName;
    private String donorCity;
    private String donorPhone;
    private String donorAddress;
    private Double latitude;
    private Double longitude;
    private String foodName;
    private String foodCategory;
    private String foodType;
    private Double quantity;
    private String unit;
    private String description;
    private String preparationDate;
    private String preparationTime;
    private String availableFrom;
    private String availableUntil;
    private String imageUrl;
    private String specialInstructions;
    private String status;
    private String matchedNgoId;
    private String matchedNgoName;
    private String assignedVolunteerId;
    private String assignedVolunteerName;
    private String createdAt;
    private String updatedAt;
    private Double distanceKm;

    public DonationDto() {}

    public DonationDto(DonationRecord r) {
        if (r != null) {
            this.id = r.getDonationCode();
            this.donorId = r.getDonorId() != null ? String.valueOf(r.getDonorId()) : null;
            this.donorName = r.getDonorName();
            this.donorCity = r.getDonorCity();
            this.donorPhone = r.getDonorPhone();
            this.donorAddress = r.getDonorAddress();
            this.latitude = r.getLatitude();
            this.longitude = r.getLongitude();
            this.foodName = r.getFoodName();
            this.foodCategory = r.getFoodCategory();
            this.foodType = r.getFoodType();
            this.quantity = r.getQuantity();
            this.unit = r.getUnit();
            this.description = r.getDescription();
            this.preparationDate = r.getPreparationDate();
            this.preparationTime = r.getPreparationTime();
            this.availableFrom = r.getAvailableFrom() != null ? r.getAvailableFrom().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.availableUntil = r.getAvailableUntil() != null ? r.getAvailableUntil().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.imageUrl = r.getImageUrl();
            this.specialInstructions = r.getSpecialInstructions();
            this.status = r.getStatus();
            this.matchedNgoId = r.getMatchedNgoId() != null ? String.valueOf(r.getMatchedNgoId()) : null;
            this.matchedNgoName = r.getMatchedNgoName();
            this.assignedVolunteerId = r.getAssignedVolunteerId() != null ? String.valueOf(r.getAssignedVolunteerId()) : null;
            this.assignedVolunteerName = r.getAssignedVolunteerName();
            this.createdAt = r.getCreatedAt() != null ? r.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.distanceKm = r.getSearchRadiusKm();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDonorId() { return donorId; }
    public void setDonorId(String donorId) { this.donorId = donorId; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorCity() { return donorCity; }
    public void setDonorCity(String donorCity) { this.donorCity = donorCity; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public String getDonorAddress() { return donorAddress; }
    public void setDonorAddress(String donorAddress) { this.donorAddress = donorAddress; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPreparationDate() { return preparationDate; }
    public void setPreparationDate(String preparationDate) { this.preparationDate = preparationDate; }

    public String getPreparationTime() { return preparationTime; }
    public void setPreparationTime(String preparationTime) { this.preparationTime = preparationTime; }

    public String getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(String availableFrom) { this.availableFrom = availableFrom; }

    public String getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(String availableUntil) { this.availableUntil = availableUntil; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMatchedNgoId() { return matchedNgoId; }
    public void setMatchedNgoId(String matchedNgoId) { this.matchedNgoId = matchedNgoId; }

    public String getMatchedNgoName() { return matchedNgoName; }
    public void setMatchedNgoName(String matchedNgoName) { this.matchedNgoName = matchedNgoName; }

    public String getAssignedVolunteerId() { return assignedVolunteerId; }
    public void setAssignedVolunteerId(String assignedVolunteerId) { this.assignedVolunteerId = assignedVolunteerId; }

    public String getAssignedVolunteerName() { return assignedVolunteerName; }
    public void setAssignedVolunteerName(String assignedVolunteerName) { this.assignedVolunteerName = assignedVolunteerName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
}
