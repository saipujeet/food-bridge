package com.foodbridge.backend.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_records")
public class DeliveryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String deliveryCode; // DEL-101

    private Long donationId;
    private String donationCode;
    private String donorName;
    private String pickupAddress;

    private String ngoName;
    private String destinationAddress;

    private Long donorId;
    private String donorPhone;
    private Double pickupLatitude;
    private Double pickupLongitude;

    private Long ngoId;
    private String ngoPhone;
    private Double dropLatitude;
    private Double dropLongitude;

    private String foodName;
    private String foodCategory;
    private Double quantity;
    private String unit;
    private String specialInstructions;
    private Double distanceKm;

    private Long volunteerId;
    private String volunteerName;
    private String volunteerPhone;

    @Column(nullable = false)
    private String status; // PENDING_ASSIGNMENT, ACCEPTED, PICKUP_PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED

    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime inTransitAt;
    private LocalDateTime deliveredAt;

    private Double lastVolunteerLat;
    private Double lastVolunteerLng;
    private Boolean isDelayed = false;
    private Integer version = 1;

    private LocalDateTime createdAt;

    public DeliveryRecord() {}

    public DeliveryRecord(String deliveryCode, Long donationId, String donationCode, String donorName, String pickupAddress,
                          String ngoName, String destinationAddress, Long volunteerId, String volunteerName, String status) {
        this.deliveryCode = deliveryCode;
        this.donationId = donationId;
        this.donationCode = donationCode;
        this.donorName = donorName;
        this.pickupAddress = pickupAddress;
        this.ngoName = ngoName;
        this.destinationAddress = destinationAddress;
        this.volunteerId = volunteerId;
        this.volunteerName = volunteerName;
        this.status = status;
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

    public String getDeliveryCode() { return deliveryCode; }
    public void setDeliveryCode(String deliveryCode) { this.deliveryCode = deliveryCode; }

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationCode() { return donationCode; }
    public void setDonationCode(String donationCode) { this.donationCode = donationCode; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public String getNgoName() { return ngoName; }
    public void setNgoName(String ngoName) { this.ngoName = ngoName; }

    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public String getVolunteerName() { return volunteerName; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getPickedUpAt() { return pickedUpAt; }
    public void setPickedUpAt(LocalDateTime pickedUpAt) { this.pickedUpAt = pickedUpAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public Double getLastVolunteerLat() { return lastVolunteerLat; }
    public void setLastVolunteerLat(Double lastVolunteerLat) { this.lastVolunteerLat = lastVolunteerLat; }

    public Double getLastVolunteerLng() { return lastVolunteerLng; }
    public void setLastVolunteerLng(Double lastVolunteerLng) { this.lastVolunteerLng = lastVolunteerLng; }

    public Boolean getIsDelayed() { return isDelayed; }
    public void setIsDelayed(Boolean isDelayed) { this.isDelayed = isDelayed; }

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }

    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }

    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public String getNgoPhone() { return ngoPhone; }
    public void setNgoPhone(String ngoPhone) { this.ngoPhone = ngoPhone; }

    public Double getDropLatitude() { return dropLatitude; }
    public void setDropLatitude(Double dropLatitude) { this.dropLatitude = dropLatitude; }

    public Double getDropLongitude() { return dropLongitude; }
    public void setDropLongitude(Double dropLongitude) { this.dropLongitude = dropLongitude; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getVolunteerPhone() { return volunteerPhone; }
    public void setVolunteerPhone(String volunteerPhone) { this.volunteerPhone = volunteerPhone; }

    public LocalDateTime getInTransitAt() { return inTransitAt; }
    public void setInTransitAt(LocalDateTime inTransitAt) { this.inTransitAt = inTransitAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
