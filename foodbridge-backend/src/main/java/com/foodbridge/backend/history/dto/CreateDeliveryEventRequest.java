package com.foodbridge.backend.history.dto;

public class CreateDeliveryEventRequest {

    private String eventType;
    private String previousStatus;
    private String newStatus;
    private String description;
    private String correlationId;

    public CreateDeliveryEventRequest() {}

    public CreateDeliveryEventRequest(String eventType, String previousStatus, String newStatus, String description, String correlationId) {
        this.eventType = eventType;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.description = description;
        this.correlationId = correlationId;
    }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
}
