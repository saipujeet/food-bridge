package com.foodbridge.backend.history.dto;

import com.foodbridge.backend.admin.entity.AuditLog;
import java.time.LocalDateTime;

public class AuditLogDto {

    private Long id;
    private Long actorId;
    private String actorEmail;
    private String actorRole;
    private String action;
    private String entityType;
    private String entityId;
    private String previousState;
    private String newState;
    private String reason;
    private String correlationId;
    private LocalDateTime createdAt;

    public AuditLogDto() {}

    public AuditLogDto(AuditLog log) {
        if (log != null) {
            this.id = log.getId();
            this.actorId = log.getActorId();
            this.actorEmail = log.getActorEmail();
            this.actorRole = log.getActorRole();
            this.action = log.getAction();
            this.entityType = log.getEntityType();
            this.entityId = log.getEntityId();
            this.previousState = log.getPreviousState();
            this.newState = log.getNewState();
            this.reason = log.getReason();
            this.correlationId = log.getCorrelationId();
            this.createdAt = log.getCreatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public String getPreviousState() { return previousState; }
    public void setPreviousState(String previousState) { this.previousState = previousState; }

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
