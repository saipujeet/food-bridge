package com.foodbridge.backend.auth.dto;

import com.foodbridge.backend.user.Role;
import java.util.List;

public class RegisterRequest {
    private Role role;
    private String name;
    private String email;
    private String phone;
    private String password;
    private String organizationName;
    private String address;
    private String city;
    private String location;
    private Double latitude;
    private Double longitude;
    private List<String> ngoCategory;
    private Integer foodCapacityKg;
    private String operatingHours;
    private String preferredArea;
    private Boolean isAvailable;

    public RegisterRequest() {}

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<String> getNgoCategory() { return ngoCategory; }
    public void setNgoCategory(List<String> ngoCategory) { this.ngoCategory = ngoCategory; }

    public Integer getFoodCapacityKg() { return foodCapacityKg; }
    public void setFoodCapacityKg(Integer foodCapacityKg) { this.foodCapacityKg = foodCapacityKg; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public String getPreferredArea() { return preferredArea; }
    public void setPreferredArea(String preferredArea) { this.preferredArea = preferredArea; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
