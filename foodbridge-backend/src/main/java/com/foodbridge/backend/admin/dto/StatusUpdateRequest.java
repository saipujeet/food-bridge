package com.foodbridge.backend.admin.dto;

public class StatusUpdateRequest {
    private String status;
    private String reason;
    private String notes;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(String status, String reason, String notes) {
        this.status = status;
        this.reason = reason;
        this.notes = notes;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
