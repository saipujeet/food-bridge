package com.foodbridge.backend.auth.dto;

import com.foodbridge.backend.user.Role;
import com.foodbridge.backend.user.User;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String email;
    private String name;
    private Role role;
    private String phone;
    private boolean active;
    private String organizationName;
    private String address;
    private String city;
    private String verificationStatus;
    private String vehicleType;
    private Integer maxCapacity;
    private Integer availableCapacity;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastActivity;
    private LocalDateTime createdAt;

    public UserDto() {}

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.name = user.getName();
            this.role = user.getRole();
            this.phone = user.getPhone();
            this.active = user.isActive();
            this.organizationName = user.getOrganizationName();
            this.address = user.getAddress();
            this.city = user.getCity();
            this.latitude = user.getLatitude();
            this.longitude = user.getLongitude();
            this.verificationStatus = user.getVerificationStatus();
            this.vehicleType = user.getVehicleType();
            this.maxCapacity = user.getMaxCapacity();
            this.availableCapacity = user.getAvailableCapacity();
            this.lastActivity = user.getLastActivity();
            this.createdAt = user.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Integer getAvailableCapacity() { return availableCapacity; }
    public void setAvailableCapacity(Integer availableCapacity) { this.availableCapacity = availableCapacity; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    @com.fasterxml.jackson.annotation.JsonProperty("isVerified")
    public boolean isVerified() {
        return "VERIFIED".equalsIgnoreCase(verificationStatus);
    }

    @com.fasterxml.jackson.annotation.JsonProperty("profileCompleted")
    public boolean isProfileCompleted() {
        return true;
    }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
