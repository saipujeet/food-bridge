package com.foodbridge.backend.analytics.dto;

public class RecentActivityDto {
    private String type; // DONATION, DELIVERY
    private String code;
    private String title;
    private String description;
    private String status;
    private String timestamp;

    public RecentActivityDto() {}

    public RecentActivityDto(String type, String code, String title, String description, String status, String timestamp) {
        this.type = type;
        this.code = code;
        this.title = title;
        this.description = description;
        this.status = status;
        this.timestamp = timestamp;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
