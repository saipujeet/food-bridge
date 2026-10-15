package com.foodbridge.backend.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_records")
public class DonationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String donationCode; // DON-1001

    private Long donorId;
    private String donorName;
    private String donorCity;
    private String donorAddress;

    private String donorPhone;
    private Double latitude;
    private Double longitude;

    private String foodName;
    private String foodCategory;
    private String foodType;
    private Double quantity;
    private String unit;
    private String description;
    private String imageUrl;
    private String specialInstructions;

    private String preparationDate;
    private String preparationTime;
    private LocalDateTime availableFrom;

    @Column(nullable = false)
    private String status; // AVAILABLE, MATCHING, ACCEPTED, PICKUP_PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, EXPIRED

    private Long matchedNgoId;
    private String matchedNgoName;

    private Long assignedVolunteerId;
    private String assignedVolunteerName;

    private LocalDateTime availableUntil;
    private Double searchRadiusKm;
    private String matchingStage;

    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;

    public DonationRecord() {}

    public DonationRecord(String donationCode, Long donorId, String donorName, String donorCity, String donorAddress,
                          String foodName, String foodCategory, Double quantity, String unit, String status,
                          LocalDateTime availableUntil, Double searchRadiusKm, String matchingStage) {
        this.donationCode = donationCode;
        this.donorId = donorId;
        this.donorName = donorName;
        this.donorCity = donorCity;
        this.donorAddress = donorAddress;
        this.foodName = foodName;
        this.foodCategory = foodCategory;
        this.quantity = quantity;
        this.unit = unit;
        this.status = status;
        this.availableUntil = availableUntil;
        this.searchRadiusKm = searchRadiusKm;
        this.matchingStage = matchingStage;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDonationCode() { return donationCode; }
    public void setDonationCode(String donationCode) { this.donationCode = donationCode; }

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorCity() { return donorCity; }
    public void setDonorCity(String donorCity) { this.donorCity = donorCity; }

    public String getDonorAddress() { return donorAddress; }
    public void setDonorAddress(String donorAddress) { this.donorAddress = donorAddress; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getMatchedNgoId() { return matchedNgoId; }
    public void setMatchedNgoId(Long matchedNgoId) { this.matchedNgoId = matchedNgoId; }

    public String getMatchedNgoName() { return matchedNgoName; }
    public void setMatchedNgoName(String matchedNgoName) { this.matchedNgoName = matchedNgoName; }

    public Long getAssignedVolunteerId() { return assignedVolunteerId; }
    public void setAssignedVolunteerId(Long assignedVolunteerId) { this.assignedVolunteerId = assignedVolunteerId; }

    public String getAssignedVolunteerName() { return assignedVolunteerName; }
    public void setAssignedVolunteerName(String assignedVolunteerName) { this.assignedVolunteerName = assignedVolunteerName; }

    public LocalDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDateTime availableUntil) { this.availableUntil = availableUntil; }

    public Double getSearchRadiusKm() { return searchRadiusKm; }
    public void setSearchRadiusKm(Double searchRadiusKm) { this.searchRadiusKm = searchRadiusKm; }

    public String getMatchingStage() { return matchingStage; }
    public void setMatchingStage(String matchingStage) { this.matchingStage = matchingStage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getFoodType() { return foodType; }
    public void setFoodType(String foodType) { this.foodType = foodType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getPreparationDate() { return preparationDate; }
    public void setPreparationDate(String preparationDate) { this.preparationDate = preparationDate; }

    public String getPreparationTime() { return preparationTime; }
    public void setPreparationTime(String preparationTime) { this.preparationTime = preparationTime; }

    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }
}
