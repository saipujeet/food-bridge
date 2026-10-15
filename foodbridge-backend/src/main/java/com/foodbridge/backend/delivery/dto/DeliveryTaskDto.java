package com.foodbridge.backend.delivery.dto;

import com.foodbridge.backend.admin.entity.DeliveryRecord;
import java.time.format.DateTimeFormatter;

public class DeliveryTaskDto {
    private String id;
    private String donationId;
    private String donorId;
    private String ngoId;
    private String volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private String donorName;
    private String donorPhone;
    private String ngoName;
    private String ngoPhone;
    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String dropAddress;
    private Double dropLatitude;
    private Double dropLongitude;
    private String foodName;
    private String foodCategory;
    private Double quantity;
    private String unit;
    private String specialInstructions;
    private String status;
    private Double distanceKm;
    private String availableUntil;
    private String createdAt;
    private String acceptedAt;
    private String pickedUpAt;
    private String inTransitAt;
    private String deliveredAt;
    private Integer version;

    public DeliveryTaskDto() {}

    public DeliveryTaskDto(DeliveryRecord r) {
        if (r != null) {
            this.id = r.getDeliveryCode();
            this.donationId = r.getDonationCode();
            this.donorId = r.getDonorId() != null ? String.valueOf(r.getDonorId()) : "1";
            this.ngoId = r.getNgoId() != null ? String.valueOf(r.getNgoId()) : "2";
            this.volunteerId = r.getVolunteerId() != null ? String.valueOf(r.getVolunteerId()) : null;
            this.volunteerName = r.getVolunteerName();
            this.volunteerPhone = r.getVolunteerPhone() != null ? r.getVolunteerPhone() : "+91 98480 77777";
            this.donorName = r.getDonorName();
            this.donorPhone = r.getDonorPhone() != null ? r.getDonorPhone() : "+91 98480 12345";
            this.ngoName = r.getNgoName();
            this.ngoPhone = r.getNgoPhone() != null ? r.getNgoPhone() : "+91 98480 88888";
            this.pickupAddress = r.getPickupAddress();
            this.pickupLatitude = r.getPickupLatitude() != null ? r.getPickupLatitude() : 15.505;
            this.pickupLongitude = r.getPickupLongitude() != null ? r.getPickupLongitude() : 80.049;
            this.dropAddress = r.getDestinationAddress();
            this.dropLatitude = r.getDropLatitude() != null ? r.getDropLatitude() : 15.5006;
            this.dropLongitude = r.getDropLongitude() != null ? r.getDropLongitude() : 80.0532;
            this.foodName = r.getFoodName() != null ? r.getFoodName() : "Surplus Meal Batch";
            this.foodCategory = r.getFoodCategory() != null ? r.getFoodCategory() : "Cooked Meals";
            this.quantity = r.getQuantity() != null ? r.getQuantity() : 25.0;
            this.unit = r.getUnit() != null ? r.getUnit() : "kg";
            this.specialInstructions = r.getSpecialInstructions() != null ? r.getSpecialInstructions() : "Please handle with care.";
            this.status = r.getStatus();
            this.distanceKm = r.getDistanceKm() != null ? r.getDistanceKm() : 1.8;
            this.availableUntil = r.getCreatedAt() != null ? r.getCreatedAt().plusHours(12).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.createdAt = r.getCreatedAt() != null ? r.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.acceptedAt = r.getAssignedAt() != null ? r.getAssignedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.pickedUpAt = r.getPickedUpAt() != null ? r.getPickedUpAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.inTransitAt = r.getInTransitAt() != null ? r.getInTransitAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.deliveredAt = r.getDeliveredAt() != null ? r.getDeliveredAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null;
            this.version = r.getVersion() != null ? r.getVersion() : 1;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDonationId() { return donationId; }
    public void setDonationId(String donationId) { this.donationId = donationId; }

    public String getDonorId() { return donorId; }
    public void setDonorId(String donorId) { this.donorId = donorId; }

    public String getNgoId() { return ngoId; }
    public void setNgoId(String ngoId) { this.ngoId = ngoId; }

    public String getVolunteerId() { return volunteerId; }
    public void setVolunteerId(String volunteerId) { this.volunteerId = volunteerId; }

    public String getVolunteerName() { return volunteerName; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }

    public String getVolunteerPhone() { return volunteerPhone; }
    public void setVolunteerPhone(String volunteerPhone) { this.volunteerPhone = volunteerPhone; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorPhone() { return donorPhone; }
    public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

    public String getNgoName() { return ngoName; }
    public void setNgoName(String ngoName) { this.ngoName = ngoName; }

    public String getNgoPhone() { return ngoPhone; }
    public void setNgoPhone(String ngoPhone) { this.ngoPhone = ngoPhone; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public Double getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(Double pickupLatitude) { this.pickupLatitude = pickupLatitude; }

    public Double getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(Double pickupLongitude) { this.pickupLongitude = pickupLongitude; }

    public String getDropAddress() { return dropAddress; }
    public void setDropAddress(String dropAddress) { this.dropAddress = dropAddress; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(String availableUntil) { this.availableUntil = availableUntil; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(String acceptedAt) { this.acceptedAt = acceptedAt; }

    public String getPickedUpAt() { return pickedUpAt; }
    public void setPickedUpAt(String pickedUpAt) { this.pickedUpAt = pickedUpAt; }

    public String getInTransitAt() { return inTransitAt; }
    public void setInTransitAt(String inTransitAt) { this.inTransitAt = inTransitAt; }

    public String getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(String deliveredAt) { this.deliveredAt = deliveredAt; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
