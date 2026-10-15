package com.foodbridge.backend.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorAdminId;

    @Column(nullable = false)
    private String actorAdminEmail;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    private String entityId;

    private String previousState;

    private String newState;

    @Column(length = 1000)
    private String reason;

    private LocalDateTime createdAt;

    private String actorRole = "ADMIN";

    private String correlationId;

    public AuditLog() {}

    public AuditLog(Long actorAdminId, String actorAdminEmail, String action, String entityType, String entityId, String previousState, String newState, String reason) {
        this.actorAdminId = actorAdminId;
        this.actorAdminEmail = actorAdminEmail;
        this.actorRole = "ADMIN";
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.previousState = previousState;
        this.newState = newState;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }

    public AuditLog(Long actorId, String actorEmail, String actorRole, String action, String entityType, String entityId, String previousState, String newState, String reason, String correlationId) {
        this.actorAdminId = actorId;
        this.actorAdminEmail = actorEmail;
        this.actorRole = actorRole != null ? actorRole : "SYSTEM";
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.previousState = previousState;
        this.newState = newState;
        this.reason = reason;
        this.correlationId = correlationId;
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

    public Long getActorAdminId() { return actorAdminId; }
    public void setActorAdminId(Long actorAdminId) { this.actorAdminId = actorAdminId; }

    public Long getActorId() { return actorAdminId; }
    public void setActorId(Long actorId) { this.actorAdminId = actorId; }

    public String getActorAdminEmail() { return actorAdminEmail; }
    public void setActorAdminEmail(String actorAdminEmail) { this.actorAdminEmail = actorAdminEmail; }

    public String getActorEmail() { return actorAdminEmail; }
    public void setActorEmail(String actorEmail) { this.actorAdminEmail = actorEmail; }

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
